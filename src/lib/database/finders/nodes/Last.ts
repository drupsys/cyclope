import { Node } from "../Node"
import { Model } from "../../Model"
import { Reference, Query } from "../../DatabaseConnection"

export class Last<M, T extends Model<M>> extends Node<M, T> {

    constructor(ref: Reference | Query, obj: Object) {
        super(ref, obj)

        this.ref = this.ref.orderByKey().limitToLast(1)
    }

}