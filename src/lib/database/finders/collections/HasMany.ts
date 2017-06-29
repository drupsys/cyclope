import { Collection } from "../Collection"
import { Model } from "../../Model"
import { DatabaseConnection } from "../../DatabaseConnection"

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