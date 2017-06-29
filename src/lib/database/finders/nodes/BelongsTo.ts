import { Node } from "../Node"
import { Model } from "../../Model"
import { DatabaseConnection } from "../../DatabaseConnection"
import { isReference } from "../../Finder"

export class BelongsTo<M, T extends Model<M>> extends Node<M, T> {

    constructor(target_name: string, obj: Object, private fk: string) {
        super(DatabaseConnection.instance().database().ref().child(target_name), obj)

        if (isReference(this.ref))
            this.ref = this.ref.child(fk)
    }

}