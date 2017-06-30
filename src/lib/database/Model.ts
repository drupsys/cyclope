import * as hash from 'object-hash'
import * as nodes from "./finders/nodes"
import * as collections from "./finders/collections"

import { DatabaseConnection, DatabaseError, IModel } from "./DatabaseConnection"

export let separator = "|"

interface ITimestamps {
    created_at: number
    updated_at: number
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

    protected belongsTo<A, T extends Model<A>>(query_node: string, query_type: Object, fk: string | undefined): nodes.BelongsTo<A, T> {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call 'belongsTo' on a non-persistent model")

        if (!fk)
            throw new DatabaseError("Can't call 'belongsTo' with am undefined foreign key")

        return new nodes.BelongsTo<A, T>(query_node, query_type, fk)
    }

    protected hasMany<A, T extends Model<A>>(query_node: string, query_type: Object, fk_name: string): collections.HasMany<A, T> {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call 'hasMany' on a non-persistent model")

        return new collections.HasMany<A, T>(query_node, query_type, "fk_" + fk_name, this.id)
    }

    protected hasOneThrough<A, T extends Model<A>>(query_node: string, query_type: Object, target_type: Object): nodes.HasOneThrough<A, T> {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call 'hasOneThrough' on a non-persistent model")

        let fks = query_node.split(separator)
        let fk_name_a = "fk_" + fks[0]
        let fk_name_b = "fk_" + fks[1]

        return new nodes.HasOneThrough<A, T>(query_node, query_type, target_type, fk_name_a, fk_name_b, this.id)
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

    public destroy(completed?: (e: Error|null) => void): void {
        if (!this.isPersistent())
            throw new DatabaseError("Can't 'destroy' non-persistent model")

        DatabaseConnection.instance().database().ref(this.type).child(this.id).remove(completed)
    }

    public save(completed?: ((e: Error|null) => any)): void {
        if (!this.isPersistent() || this.isChanged()) {
            this.index = DatabaseConnection.instance().updateTable({
                index: this.index,
                fields: this.attributes,
                type: this.type
            }, completed)
        }

        this.hash = this.last_hash
    }
}