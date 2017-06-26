import { BaseNode, Finder } from "../../database/connection";
import { Exchange } from "./Exchange"

interface IExchangeType {
    pair: string
	from: string
	to: string
	fk_exchange: string
    
}

export class ExchangeType extends BaseNode<IExchangeType> {
    static readonly TAG = "exchange_types"
    
    constructor(fields: IExchangeType) {
        super(fields, ExchangeType.TAG)
    }

    public exchange(callback: (data: Exchange) => void): void {
        this.belongsTo<Exchange>("exchanges", Exchange.prototype, this.fields.fk_exchange, callback)
    }

    public static find(): Finder<ExchangeType> {
        return new Finder<ExchangeType>(ExchangeType.TAG, ExchangeType.prototype)
    }
}