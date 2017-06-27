import * as firebase from 'firebase-admin'

interface IBaseNode {
    index: string
    type: string
    fields: { [key: string]: any }
}

interface ITimeStamps {
    created_at: number
    updated_at: number
}

class DatabaseError extends Error {}

interface Window { 
    [key: string]: any
}

export class DatabaseConnection {
    private static ref: DatabaseConnection

    private db: firebase.database.Database
    private authentication = require("serviceAccountKey.json")

    private constructor(){
        firebase.initializeApp({
            credential:  firebase.credential.cert(this.authentication),
            databaseURL: "https://cryptohaven-299ff.firebaseio.com"
        })

        this.db = firebase.database()
    }

    public static instance(): DatabaseConnection {
        if (this.ref == null) {
            this.ref = new DatabaseConnection();
        }

        return this.ref;
    }

    public updateTable(model: IBaseNode): string {
        let t: { [key: string]: { [key: string]: any } } = {};
        let persistent = model.index != ""
        let timestamp = + new Date()

        if (!persistent) {
            let key = this.db.ref().child(model.type).push().key
            if (key) {
                model.index = key
            } else {
                throw new DatabaseError("Could not acquire key for [" + model.type + "]");
            }
            
            model.fields["created_at"] = timestamp
        }   

        model.fields["updated_at"] = timestamp
        t["/" + model.type + "/" + model.index] = model.fields
        this.db.ref().update(t)

        return model.index
    }

    public database(): firebase.database.Database {
        return this.db
    }
}

export class BaseNode<M> {
    private index: string
    private relations: { [key: string]: any | null } = {}

    constructor(private attributes: M | ITimeStamps, private type: string) {
        this.index = ""
    }

    get fields(): M {
        return <M>this.attributes
    }

    get timestamp(): ITimeStamps {
        return <ITimeStamps>this.attributes
    }

    protected belongsTo<T>(nodeName: string, obj: Object, id: string, callback: ((data: T) => void)): void {
        if (!this.relations[nodeName]) this.relations[nodeName] = {}

        let relation = this.relations[nodeName][id]
        
        if (relation) {
            callback(<T>relation)
        } else {
            new Finder<T>(nodeName, obj).byKey(id).load((node: T): void => {
                this.relations[nodeName][id] = node
                callback(<T>node)
            })
        }
    }

    protected hasMany<T>() {

    }

    public get id(): string {
        return this.index
    }

    public save(): void {
        this.index = DatabaseConnection.instance().updateTable({
            index: this.index,
            fields: this.attributes,
            type: this.type
        })
    }
}

export class Finder<T> {
    protected ref: firebase.database.Reference

    constructor(private nodeName: string, private obj: Object) {
        this.ref = DatabaseConnection.instance().database().ref().child(nodeName) 
    }

    public all(): All<T> {
        return new All<T>(this.ref, this.obj)
    }

    public byKey(id: string): ByKey<T> {
        return new ByKey<T>(this.ref, this.obj, id)
    }

    public order(field: string): Order<T> {
        return new Order<T>(this.ref, this.obj, field)
    }
}

abstract class Node<T> {
    protected node: firebase.database.Reference
    protected obj: Object

    constructor(ref: firebase.database.Reference, obj: Object) {
        this.node = ref
        this.obj = obj
    }

    public load(callback: ((node: T) => void)): void {
        this.node.once("value", (snapshot: firebase.database.DataSnapshot): void => {
            let result = this.obj.constructor.apply(
                Object.create(this.obj), new Array(snapshot.val()))
        
            result.index = snapshot.key

            callback(<T>result)
        })
    }

    public destroy(): void {
        this.node.remove()
    }
}

class ByKey<T> extends Node<T> {

    constructor(ref: firebase.database.Reference, obj: Object, id: string) {
        super(ref, obj)
        this.node = this.node.child(id)
    }

}

abstract class Map<T> {
    protected node: firebase.database.Reference | null
    protected map: firebase.database.Query | null
    protected obj: Object

    constructor(ref: firebase.database.Reference | firebase.database.Query, obj: Object) {
        this.node = <firebase.database.Reference>ref
        this.map = <firebase.database.Query>ref
        this.obj = obj
    }

    private response(snapshot: any, callback: ((node: T[]) => void)): void {
        let records: T[] = new Array()
        snapshot.forEach((element: firebase.database.DataSnapshot) => {
            let result = this.obj.constructor.apply(
                Object.create(this.obj), new Array(element.val()))
    
            result.index = element.key

            records.push(<T>result)
        })

        callback(records)
    }

    public load(callback: ((node: T[]) => void)): void {
        if (this.map) {
            this.map.once("value", (snapshot: any): void => {
                this.response(snapshot, callback)
            })
        } else if (this.node) {
            this.node.once("value", (snapshot: any): void => {
                this.response(snapshot, callback)
            })
        }
    }

    public destroy_all(): void {

    }
}

class All<T> extends Map<T> {
    
    constructor(ref: firebase.database.Reference, obj: Object) {
        super(ref, obj)
    }

}

class Order<T> extends Map<T> {

    constructor(ref: firebase.database.Reference, obj: Object, field: string) {
        super(ref, obj)
        if (this.node) {
            this.map = this.node.orderByChild(field)
        } else if (this.map) {
            this.map = this.map.orderByChild(field)
        }
    }
}