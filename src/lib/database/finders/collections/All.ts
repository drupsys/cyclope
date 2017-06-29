import { Collection } from "../Collection"
import { Model } from "../../Model"
import { Reference } from "../../DatabaseConnection"

export class All<M, T extends Model<M>> extends Collection<M, T> {
    
    constructor(ref: Reference, obj: Object) {
        super(ref, obj)
    }

}