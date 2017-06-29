import { Model } from "../Model"
import { isReference } from "../Finder"
import { Reference, Query, Snapshot } from "../DatabaseConnection"

export abstract class Node<M, T extends Model<M>> {
    protected ref: Reference | Query
    protected obj: Object

    constructor(ref: Reference | Query, obj: Object) {
        this.ref = ref
        this.obj = obj
    }

    private responseNode(callback: ((node: T) => void)) {
        this.ref.once("value", (snapshot: Snapshot): void => {
            let result = this.obj.constructor.apply(
                Object.create(this.obj), new Array(snapshot.val()))
        
            result.index = snapshot.key

            callback(<T>result)
        })
    }

    private responseCollection(callback: ((node: T) => void)) {
        this.ref.once("value", (snapshot: any): void => {
            let records: T[] = new Array()
            snapshot.forEach((element: Snapshot) => {
                let result = this.obj.constructor.apply(
                    Object.create(this.obj), new Array(element.val()))
        
                result.index = element.key
                records.push(<T>result)
            })

            callback(<T>records[0])
        })
    }

    public load(callback: ((node: T) => void)): void {
        if (isReference(this.ref)) {
            this.responseNode(callback)
        } else {
            this.responseCollection(callback)
        }
    }

    public destroy(): void {
        this.load((node: T): void => {
            node.destroy()
        })
    }
}