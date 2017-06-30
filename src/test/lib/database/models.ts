import * as db from "../../../lib/database"

export interface INodeA {
    name: string
}

export class NodeA extends db.Model<INodeA> {
    static readonly TAG = "node_a"

    constructor(fields: INodeA) {
        super(fields, NodeA.TAG)
    }

    public static find(): db.Finder<INodeA, NodeA> {
        return new db.Finder<INodeA, NodeA>(NodeA.TAG, NodeA.prototype)
    }

}

export interface INodeB {

}

export class NodeB extends db.Model<INodeB> {
    static readonly TAG = "node_b"

    constructor(fields: INodeB) {
        super(fields, NodeB.TAG)
    }

    public static find(): db.Finder<INodeB, NodeB> {
        return new db.Finder<INodeB, NodeB>(NodeB.TAG, NodeB.prototype)
    }
    
}

export interface INodeC {

}

export class NodeC extends db.Model<INodeC> {
    static readonly TAG = "node_c"

    constructor(fields: INodeC) {
        super(fields, NodeC.TAG)
    }

    public static find(): db.Finder<INodeC, NodeC> {
        return new db.Finder<INodeC, NodeC>(NodeC.TAG, NodeC.prototype)
    }
    
}