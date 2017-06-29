import { Model } from "../Model"
import { Reference, Query, Snapshot } from "../DatabaseConnection"

export abstract class Collection<M, T extends Model<M>> {
    protected ref: Reference | Query
    protected obj: Object

    constructor(ref: Reference | Query, obj: Object) {
        this.ref = ref
        this.obj = obj
    }

    public load(callback: ((node: T[]) => void)): void {
        this.ref.once("value", (snapshot: any): void => {
            let records: T[] = new Array()
            snapshot.forEach((element: Snapshot) => {
                let result = this.obj.constructor.apply(
                    Object.create(this.obj), new Array(element.val()))
        
                result.index = element.key

                records.push(<T>result)
            })

            callback(records)
        })
    }

    public destroy_all(): void {
        this.load((node: T[]): void => {
            node.forEach(element => {
                element.destroy()
            })
        })
    }
}