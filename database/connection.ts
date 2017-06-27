import * as firebase from 'firebase-admin'
import * as hash from 'object-hash'

let separator = "|"

interface IModel {
    index: string
    type: string
    fields: { [key: string]: any }
}

interface ITimestamps {
    created_at: number
    updated_at: number
}

class DatabaseError extends Error {}

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

    public updateTable(model: IModel): string {
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

export class Model<M> {
    private hash: string
    private last_hash: string
    private index: string
    private attributes: M | ITimestamps

    constructor(attributes: M, private type: string) {
        this.index = ""
        this.attributes = attributes
        this.hash = hash.MD5(attributes)
    }

    get fields(): M {
        return <M>this.attributes
    }

    get timestamp(): ITimestamps {
        return <ITimestamps>this.attributes
    }

    public belongsTo<T extends Model<any>>(query_node: string, query_type: Object, fk: string | undefined): BelongsTo<T> {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call belongs to on a non-persistent model")

        if (!fk)
            throw new DatabaseError("foreign key cannot be undefined")

        return new Finder<T>(query_node, query_type).belongsTo(fk)
    }

    public hasMany<T extends Model<any>>(query_node: string, query_type: Object, fk_name: string): HasMany<T> {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call has many on a non-persistent model")

        return new Finder<T>(query_node, query_type).hasMany("fk_" + (fk_name).slice(0, fk_name.length - 1), this.id)
    }

    public hasOneThrough<T extends Model<any>>(query_node: string, query_type: Object, target_type: Object): HasOneThrough<T> {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call has many on a non-persistent model")

        let fks = query_node.split(separator)
        let fk_name_a = "fk_" + fks[0].slice(0, fks[0].length - 1)
        let fk_name_b = "fk_" + fks[1].slice(0, fks[1].length - 1)

        return new Finder<T>(query_node, query_type).hasOneThrough(query_node, target_type, fk_name_a, fk_name_b, this.id)
    }

    public isPersistent(): boolean {
        return this.index != ""
    }

    public isChanged(): boolean {
        this.last_hash = hash.MD5(this.attributes)
        return this.last_hash != this.hash
    }

    public get id(): string {
        return this.index
    }

    public destroy(): void {
        if (!this.isPersistent())
            throw new DatabaseError("Can't destroy non-persistent model")

        console.log("/" + this.type + "/" + this.id)

        DatabaseConnection.instance().database().ref(this.type).child(this.id).remove()
    }

    public save(): void {
        if (!this.isPersistent() || this.isChanged()) {
            this.index = DatabaseConnection.instance().updateTable({
                index: this.index,
                fields: this.attributes,
                type: this.type
            })
        }

        this.hash = this.last_hash
    }
}

export class Finder<T extends Model<any>> {
    protected ref: firebase.database.Reference

    constructor(protected nodeName: string | null, protected obj: Object) {
        if (nodeName) {
            this.ref = DatabaseConnection.instance().database().ref().child(nodeName)
        }
    }

    public all(): All<T> {
        return new All<T>(this.ref, this.obj)
    }

    public order(field: string): Order<T> {
        return new Order<T>(this.ref, this.obj, field)
    }
    
    public hasMany(fk_name: string, fk: string): HasMany<T> {
        return new HasMany<T>(this.ref, this.obj, fk_name, fk)
    }

    public hasOneThrough(middle_name: string, target: Object, fk_name_a: string, fk_name_b: string, fk_a: string): HasOneThrough<T> {
        return new HasOneThrough<T>(this.ref, this.obj, target, middle_name, fk_name_a, fk_name_b, fk_a)
    }

    public belongsTo(fk: string): BelongsTo<T> {
        return new BelongsTo<T>(this.ref, this.obj, fk)
    }

    public byKey(id: string): ByKey<T> {
        return new ByKey<T>(this.ref, this.obj, id)
    }

}

abstract class Node<T extends Model<any>> {

    constructor(protected ref: firebase.database.Reference, protected obj: Object) { }

    public load(callback: ((node: T) => void)): void {
        this.ref.once("value", (snapshot: firebase.database.DataSnapshot): void => {
            let result = this.obj.constructor.apply(
                Object.create(this.obj), new Array(snapshot.val()))
        
            result.index = snapshot.key

            callback(<T>result)
        })
    }

    public destroy(): void {
        this.load((node: T): void => {
            node.destroy()
        })
    }
}

class ByKey<T extends Model<any>> extends Node<T> {

    constructor(ref: firebase.database.Reference, obj: Object, id: string) {
        super(ref, obj)
        this.ref = this.ref.child(id)
    }

}

export class BelongsTo<T extends Model<any>> extends Node<T> {

    constructor(ref: firebase.database.Reference, obj: Object, private fk: string) {
        super(ref, obj)
        this.ref = this.ref.child(fk)
    }

}

abstract class Collection<T extends Model<any>> {
    protected ref: firebase.database.Reference | null
    protected map: firebase.database.Query | null
    protected obj: Object

    constructor(ref: firebase.database.Reference | firebase.database.Query, obj: Object) {
        this.ref = <firebase.database.Reference>ref
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
        } else if (this.ref) {
            this.ref.once("value", (snapshot: any): void => {
                this.response(snapshot, callback)
            })
        }
    }

    public destroy_all(): void {
        this.load((node: T[]): void => {
            node.forEach(element => {
                element.destroy()
            })
        })
    }
}

class All<T extends Model<any>> extends Collection<T> {
    
    constructor(ref: firebase.database.Reference, obj: Object) {
        super(ref, obj)
    }

}

class Order<T extends Model<any>> extends Collection<T> {

    constructor(ref: firebase.database.Reference, obj: Object, field: string) {
        super(ref, obj)
        if (this.ref) {
            this.map = this.ref.orderByChild(field)
        } else if (this.map) {
            this.map = this.map.orderByChild(field)
        }
    }

}

export class HasMany<T extends Model<any>> extends Collection<T> {
    
    constructor(ref: firebase.database.Reference, obj: Object, private fk_name: string, private fk: string) {
        super(ref, obj)
 
        if (this.ref) {
            this.map = this.ref.orderByChild(fk_name).equalTo(fk)
        } else if (this.map) {
            this.map = this.map.orderByChild(fk_name).equalTo(fk)
        }
    }

    public push(node: Model<any>): void {
        node.fields[this.fk_name] = this.fk
        node.save()
    }
}

export class HasOneThrough<T extends Model<any>> extends Collection<T> {
    
    constructor(ref: firebase.database.Reference, middle: Object, target: Object, private middle_name: string, private fk_name_a: string, private fk_name_b: string, private fk_a: string) {
        super(ref, middle)

        if (this.ref) {
            this.map = this.ref.orderByChild(this.fk_name_a).equalTo(fk_a)
        } else if (this.map) {
            this.map = this.map.orderByChild(this.fk_name_a).equalTo(fk_a)
        }
    }

    public loadThrough(callback: ((node: T) => void)): void {
        new Finder<T>(this.middle_name, this.obj).hasMany(this.fk_name_a, this.fk_a).load((node: T[]): void => {
            let middle = <any>node[0]
            let f = this.fk_name_b.slice(3);
            middle[f]().load(callback)
        })
    }

    public set(node: T): void {
        new Finder<T>(this.middle_name, this.obj).hasMany(this.fk_name_a, this.fk_a).load((nodes: T[]): void => {
            nodes.forEach(element => {
                element.destroy()
            })

            node.save()

            let attributes: any = {}
            attributes[this.fk_name_a] = this.fk_a
            attributes[this.fk_name_b] = node.id

            let middle = new Model<any>(attributes, this.middle_name)
            middle.save()
        })
    }
}

export class HasManyThrough<T extends Model<any>> extends Collection<T> {

}