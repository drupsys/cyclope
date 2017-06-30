import { Model } from "../Model"
import { Reference, Query, Snapshot } from "../DatabaseConnection"

export abstract class Collection<M, T extends Model<M>> {
    protected ref: Reference | Query
    protected obj: Object

    constructor(ref: Reference | Query, obj: Object) {
        this.ref = ref
        this.obj = obj
    }

    public load(callback: ((node: T[]) => void), completed?: ((e: Error|null) => void)): void {
        this.ref.once("value", (snapshot: any): void => {
            let records: T[] = new Array()
            snapshot.forEach((element: Snapshot) => {
                let attrs = new Array(element.val())
                let result = Reflect.construct(this.obj.constructor, attrs)

                result.index = element.key

                records.push(<T>result)
            })

            callback(records)
        }, (e: Error|null):void => {
            if (completed) completed(e)
        })
    }

    public destroy_all(completed?: ((e: Error|null) => void)): void {
        this.load((nodes: T[]): void => {
            nodes.forEach(element => {
                element.destroy()
            })

            if (completed) completed(null)
        }, (e: Error): void => {
            if (completed) completed(e)
        })
    }
}