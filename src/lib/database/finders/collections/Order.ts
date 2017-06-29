import { Collection } from "../Collection"
import { Model } from "../../Model"
import { Reference } from "../../DatabaseConnection"

export class Order<M, T extends Model<M>> extends Collection<M, T> {

    constructor(ref: Reference, obj: Object, field: string) {
        super(ref, obj)

        this.ref = this.ref.orderByChild(field)
    }

}