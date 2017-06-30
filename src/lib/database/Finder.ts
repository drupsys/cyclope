import * as nodes from "./finders/nodes"
import * as collections from "./finders/collections"

import { Model } from "./Model"
import { DatabaseConnection, Reference, Query } from "./DatabaseConnection"

export function isReference(object: Reference | Query): object is Reference {
    if (typeof (<any>object).child == 'function') {
        return true
    } else {
        return false
    }
}

export class Finder<M, T extends Model<M>> {
    protected ref: Reference

    constructor(protected nodeName: string | null, protected obj: Object) {
        if (nodeName) {
            this.ref = DatabaseConnection.instance().database().ref().child(nodeName)
        }
    }

    public first(): nodes.First<M, T> {
        return new nodes.First<M, T>(this.ref, this.obj)
    }

    public last(): nodes.Last<M, T> {
        return new nodes.Last<M, T>(this.ref, this.obj)
    }

    public all(): collections.All<M, T> {
        return new collections.All<M, T>(this.ref, this.obj)
    }

    public order(field: string): collections.Order<M, T> {
        return new collections.Order<M, T>(this.ref, this.obj, field)
    }

    public byKey(id: string): nodes.ByKey<M, T> {
        return new nodes.ByKey<M, T>(this.ref, this.obj, id)
    }

    public byValue(name: string, value: string): nodes.ByField<M, T> {
        return new nodes.ByField<M, T>(this.ref, this.obj, name, value)
    }

}