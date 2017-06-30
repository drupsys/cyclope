import { Node } from "../Node"
import { Model } from "../../Model"
import { Reference, Query } from "../../DatabaseConnection"

export class ByField<M, T extends Model<M>> extends Node<M, T> {

    constructor(ref: Reference | Query, obj: Object, name: string, value: string) {
        super(ref, obj)

        this.ref = this.ref.orderByChild(name).equalTo(value).limitToLast(1)
    }

}