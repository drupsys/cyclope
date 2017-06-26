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
        let relation = this.relations[id]
        
        if (this.relations[id]) {
            callback(<T>relation)
        } else {
            new Finder<T>(nodeName, obj).byKey(id).commit((node: T): void => {
                this.relations[id] = node
                callback(<T>node)
            })
        }
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
    private obj: Object

    constructor(nodeName: string, obj: Object) {
        this.ref = DatabaseConnection.instance().database().ref(nodeName) 
        this.obj = obj
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

abstract class Filter<T> {
    protected ref: firebase.database.Reference
    protected obj: Object

    constructor(nodeName: firebase.database.Reference, obj: Object) {
        this.ref = nodeName 
        this.obj = obj
    }

    public commit(callback: ((node: T) => void)): void {
        this.ref.once("value", (snapshot: firebase.database.DataSnapshot): void => {
            let result = this.obj.constructor.apply(
                this.obj, new Array(snapshot.val()))
        
            result.index = snapshot.key

            callback(<T>result)
        })
    }
}

class ByKey<T> extends Filter<T> {

    constructor(ref: firebase.database.Reference, obj: Object, id: string) {
        super(ref, obj)
        this.ref = this.ref.child(id)
    }

}

abstract class Query<T> {
    protected ref: firebase.database.Reference | null
    protected query: firebase.database.Query | null
    protected obj: Object

    constructor(nodeName: firebase.database.Reference | firebase.database.Query, obj: Object) {
        this.ref = <firebase.database.Reference>nodeName
        this.query = <firebase.database.Query>nodeName
        this.obj = obj
    }

    private response(snapshot: any, callback: ((node: T[]) => void)): void {
        let records: T[] = []
        snapshot.forEach((element: firebase.database.DataSnapshot) => {
            let result = this.obj.constructor.apply(
                this.obj, new Array(element.val()))
    
            result.index = element.key

            records.push(<T>result)
        })

        callback(records)
    }

    public commit(callback: ((node: T[]) => void)): void {
        if (this.query) {
            this.query.once("value", (snapshot: any): void => {
                this.response(snapshot, callback)
            })
        } else if (this.ref) {
            this.ref.once("value", (snapshot: any): void => {
                this.response(snapshot, callback)
            })
        }
    }
}

class All<T> extends Query<T> {
    
    constructor(ref: firebase.database.Reference, obj: Object) {
        super(ref, obj)
    }

}

class Order<T> extends Query<T> {

    constructor(ref: firebase.database.Reference, obj: Object, field: string) {
        super(ref, obj)
        if (this.ref) {
            this.query = this.ref.orderByChild(field)
        } else if (this.query) {
            this.query = this.query.orderByChild(field)
        }
    }
}