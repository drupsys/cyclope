import * as firebase from 'firebase-admin'
import * as hash from 'object-hash'

let separator = "|"

type Reference = firebase.database.Reference
type Query = firebase.database.Query
type Snapshot = firebase.database.DataSnapshot

function isReference(object: Reference | Query): object is Reference {
    if (typeof (<any>object).child == 'function') {
        return true
    } else {
        return false
    }
}

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

    protected belongsTo<T extends Model<any>>(query_node: string, query_type: Object, fk: string | undefined): BelongsTo<M, T> {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call 'belongsTo' on a non-persistent model")

        if (!fk)
            throw new DatabaseError("Can't call 'belongsTo' with am undefined foreign key")

        return new BelongsTo<M, T>(query_node, query_type, fk)
    }

    protected hasMany<T extends Model<any>>(query_node: string, query_type: Object, fk_name: string): HasMany<M, T> {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call 'hasMany' on a non-persistent model")

        return new HasMany<M, T>(query_node, query_type, "fk_" + fk_name, this.id)
    }

    protected hasOneThrough<T extends Model<any>>(query_node: string, query_type: Object, target_type: Object): HasOneThrough<M, T> {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call 'hasOneThrough' on a non-persistent model")

        let fks = query_node.split(separator)
        let fk_name_a = "fk_" + fks[0]
        let fk_name_b = "fk_" + fks[1]

        return new HasOneThrough<M, T>(query_node, query_type, target_type, fk_name_a, fk_name_b, this.id)
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
            throw new DatabaseError("Can't 'destroy' non-persistent model")

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

export class Finder<M, T extends Model<M>> {
    protected ref: Reference

    constructor(protected nodeName: string | null, protected obj: Object) {
        if (nodeName) {
            this.ref = DatabaseConnection.instance().database().ref().child(nodeName)
        }
    }

    public all(): All<M, T> {
        return new All<M, T>(this.ref, this.obj)
    }

    public order(field: string): Order<M, T> {
        return new Order<M, T>(this.ref, this.obj, field)
    }

    public byKey(id: string): ByKey<M, T> {
        return new ByKey<M, T>(this.ref, this.obj, id)
    }

    public byValue(name: string, value: string): ByField<M, T> {
        return new ByField<M, T>(this.ref, this.obj, name, value)
    }

}

abstract class Node<M, T extends Model<M>> {
    protected ref: Reference | Query
    protected obj: Object

    constructor(ref: Reference | Query, obj: Object) {
        this.ref = ref
        this.obj = obj
    }

    private responseNode(callback: ((node: T) => void)) {
        this.ref.once("value", (snapshot: Snapshot): void => {
            let result = this.obj.constructor.apply(
                Object.create(this.obj), new Array(snapshot.val()))
        
            result.index = snapshot.key

            callback(<T>result)
        })
    }

    private responseCollection(callback: ((node: T) => void)) {
        this.ref.once("value", (snapshot: any): void => {
            let records: T[] = new Array()
            snapshot.forEach((element: Snapshot) => {
                let result = this.obj.constructor.apply(
                    Object.create(this.obj), new Array(element.val()))
        
                result.index = element.key
                records.push(<T>result)
            })

            callback(<T>records[0])
        })
    }

    public load(callback: ((node: T) => void)): void {
        if (isReference(this.ref)) {
            this.responseNode(callback)
        } else {
            this.responseCollection(callback)
        }
    }

    public destroy(): void {
        this.load((node: T): void => {
            node.destroy()
        })
    }
}

class ByKey<M, T extends Model<M>> extends Node<M, T> {

    constructor(ref: Reference | Query, obj: Object, id: string) {
        super(ref, obj)

        if (isReference(this.ref))
            this.ref = this.ref.child(id)
    }

}

class ByField<M, T extends Model<M>> extends Node<M, T> {

    constructor(ref: Reference | Query, obj: Object, name: string, value: string) {
        super(ref, obj)

        this.ref = this.ref.orderByChild(name).equalTo(value).limitToLast(1)
    }

}

export class BelongsTo<M, T extends Model<M>> extends Node<M, T> {

    constructor(target_name: string, obj: Object, private fk: string) {
        super(DatabaseConnection.instance().database().ref().child(target_name), obj)

        if (isReference(this.ref))
            this.ref = this.ref.child(fk)
    }

}

export class HasOneThrough<M, T extends Model<M>> extends Node<M, T> {
    
    constructor(private middle_name: string, middle: Object, private target: Object, private fk_name_a: string, private fk_name_b: string, private fk_a: string) {
        super(DatabaseConnection.instance().database().ref().child(middle_name), middle)

        this.ref = this.ref.orderByChild(this.fk_name_a).equalTo(fk_a)
    }

    public load(callback: ((node: T) => void)): void {
        super.load((middle: T): void => {   
            let target_name = this.middle_name.split(separator)[1]
            let target_key = (<any>middle.fields)[this.fk_name_b]

            new Finder<M, T>(target_name, this.target).
                byKey(target_key).
                load(callback)
        })
    }

    public set(target: T): void {
        super.load((old_middle: T): void => {
            
            old_middle.destroy()
            target.save()

            let attributes: any = {}
            attributes[this.fk_name_a] = this.fk_a
            attributes[this.fk_name_b] = target.id

            let new_middle = new Model<any>(attributes, this.middle_name)
            new_middle.save()
        })

        // new Finder<T>(this.middle_name, this.obj).
        //     byValue(this.fk_name_a, this.fk_a).
        //     load()
    }
}

abstract class Collection<M, T extends Model<M>> {
    protected ref: Reference | Query
    protected obj: Object

    constructor(ref: Reference | Query, obj: Object) {
        this.ref = ref
        this.obj = obj
    }

    public load(callback: ((node: T[]) => void)): void {
        this.ref.once("value", (snapshot: any): void => {
            let records: T[] = new Array()
            snapshot.forEach((element: Snapshot) => {
                let result = this.obj.constructor.apply(
                    Object.create(this.obj), new Array(element.val()))
        
                result.index = element.key

                records.push(<T>result)
            })

            callback(records)
        })
    }

    public destroy_all(): void {
        this.load((node: T[]): void => {
            node.forEach(element => {
                element.destroy()
            })
        })
    }
}

class All<M, T extends Model<M>> extends Collection<M, T> {
    
    constructor(ref: firebase.database.Reference, obj: Object) {
        super(ref, obj)
    }

}

class Order<M, T extends Model<M>> extends Collection<M, T> {

    constructor(ref: firebase.database.Reference, obj: Object, field: string) {
        super(ref, obj)

        this.ref = this.ref.orderByChild(field)
    }

}

export class HasMany<M, T extends Model<M>> extends Collection<M, T> {
    
    constructor(target_name: string, obj: Object, private fk_name: string, private fk: string) {
        super(DatabaseConnection.instance().database().ref().child(target_name), obj)
 
        this.ref = this.ref.orderByChild(fk_name).equalTo(fk)
    }

    public push(node: T): void {
        (<any>node.fields)[this.fk_name] = this.fk
        node.save()
    }

}

export class HasManyThrough<M, T extends Model<M>> extends Collection<M, T> {

}