import { Model, Finder, HasMany } from "../../database/connection";
import { ExchangeType } from "./ExchangeType"

interface IExchange {
    name: string

}

export class Exchange extends Model<IExchange> {
    static readonly TAG = "exchanges"

    constructor(fields: IExchange) {
        super(fields, Exchange.TAG)
    }

    public exchangeTypes(): HasMany<ExchangeType> {
        return this.hasMany<ExchangeType>(ExchangeType.TAG, ExchangeType.prototype, Exchange.TAG)
    }

    public static find(): Finder<Exchange> {
        return new Finder<Exchange>(Exchange.TAG, Exchange.prototype)
    }
}