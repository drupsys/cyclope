import { Model, Finder, HasMany } from "../../database/connection";
import { ExchangeType, IExchangeType } from "./ExchangeType"

export interface IExchange {
    name: string

}

export class Exchange extends Model<IExchange> {
    static readonly TAG = "exchanges"

    constructor(fields: IExchange) {
        super(fields, Exchange.TAG)
    }

    public exchangeTypes(): HasMany<IExchangeType, ExchangeType> {
        return this.hasMany<ExchangeType>(ExchangeType.TAG, ExchangeType.prototype, Exchange.TAG)
    }

    public static find(): Finder<IExchange, Exchange> {
        return new Finder<IExchange, Exchange>(Exchange.TAG, Exchange.prototype)
    }
}