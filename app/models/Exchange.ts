import { BaseNode, Finder } from "../../database/connection";
import { ExchangeType } from "./ExchangeType"

interface IExchange {
    name: string

}

export class Exchange extends BaseNode<IExchange> {
    static readonly TAG = "exchanges"

    constructor(fields: IExchange) {
        super(fields, Exchange.TAG)
    }

    public static find(): Finder<Exchange> {
        return new Finder<Exchange>(Exchange.TAG, Exchange.prototype)
    }
}