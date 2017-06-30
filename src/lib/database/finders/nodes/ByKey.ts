import { Node } from "../Node"
import { Model } from "../../Model"
import { Reference, Query } from "../../DatabaseConnection"
import { isReference } from "../../Finder"

export class ByKey<M, T extends Model<M>> extends Node<M, T> {

    constructor(ref: Reference | Query, obj: Object, id: string) {
        super(ref, obj)

        if (isReference(this.ref))
            this.ref = this.ref.child(id)
    }

}