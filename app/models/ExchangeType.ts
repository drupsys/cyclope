import { Model, Finder, BelongsTo, HasMany, HasOneThrough } from "../../database/connection";
import { Exchange } from "./Exchange"
import { Interval } from "./Interval"
import { CurrentInterval } from "./CurrentInterval"

interface IExchangeType {
    pair: string
	from: string
	to: string
	fk_exchange: string
    
}

export class ExchangeType extends Model<IExchangeType> {
    static readonly TAG = "exchange_types"
    
    constructor(fields: IExchangeType) {
        super(fields, ExchangeType.TAG)
    }

    public exchange(): BelongsTo<Exchange> {
        return this.belongsTo<Exchange>(Exchange.TAG, Exchange.prototype, this.fields.fk_exchange)
    }

    public intervals(): HasMany<Interval> {
        return this.hasMany<Interval>(Interval.TAG, Interval.prototype, ExchangeType.TAG)
    }

    public currentInterval(): HasOneThrough<Interval> {
        return this.hasOneThrough(CurrentInterval.TAG, CurrentInterval.prototype, Interval.prototype)
    }

    public static find(): Finder<ExchangeType> {
        return new Finder<ExchangeType>(ExchangeType.TAG, ExchangeType.prototype)
    }
}