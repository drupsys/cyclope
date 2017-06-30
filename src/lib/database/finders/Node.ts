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

    private responseNode(callback: ((node: T) => void), completed?: ((e: Error|null) => void)) {
        this.ref.once("value", (snapshot: Snapshot): void => {
            let attrs = new Array(snapshot.val())
            let result = Reflect.construct(this.obj.constructor, attrs)
        
            result.index = snapshot.key

            callback(<T>result)
        }, (e: Error|null): void => {
            if (completed) completed(e)
        })
    }

    private responseCollection(callback: ((node: T) => void), completed?: ((e: Error|null) => void)) {
        this.ref.once("value", (snapshot: any): void => {
            let records: T[] = new Array()
            snapshot.forEach((element: Snapshot) => {
                let attrs = new Array(element.val())
                let result = Reflect.construct(this.obj.constructor, attrs)
        
                result.index = element.key
                records.push(<T>result)
            })

            callback(<T>records[0])
        }, (e: Error|null): void => {
            if (completed) completed(e)
        })
    }

    public load(callback: ((node: T) => void), completed?: ((e: Error|null) => void)): void {
        if (isReference(this.ref)) {
            this.responseNode(callback, completed)
        } else {
            this.responseCollection(callback, completed)
        }
    }

    public destroy(completed?: ((e: Error|null) => void)): void {
        this.load((node: T): void => {
            node.destroy(completed)
        }, completed)
    }
}