import { Node } from "../Node"
import { Model, separator } from "../../Model"
import { DatabaseConnection } from "../../DatabaseConnection"
import { Finder } from "../../Finder"

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