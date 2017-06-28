import { Model, Finder, BelongsTo, HasMany, HasOneThrough } from "../../database/connection";
import { IExchange, Exchange } from "./Exchange"
import { IInterval, Interval } from "./Interval"
import { ICurrentInterval, CurrentInterval } from "./CurrentInterval"

export interface IExchangeType {
	from: string
	to: string
	fk_exchanges?: string
    
}

export class ExchangeType extends Model<IExchangeType> {
    static readonly TAG = "exchange_types"
    
    constructor(fields: IExchangeType) {
        super(fields, ExchangeType.TAG)
    }

    public exchange(): BelongsTo<IExchange, Exchange> {
        return this.belongsTo<Exchange>(Exchange.TAG, Exchange.prototype, this.fields.fk_exchanges)
    }

    public intervals(): HasMany<IInterval, Interval> {
        return this.hasMany<Interval>(Interval.TAG, Interval.prototype, ExchangeType.TAG)
    }

    public currentInterval(): HasOneThrough<IInterval, Interval> {
        return this.hasOneThrough(CurrentInterval.TAG, CurrentInterval.prototype, Interval.prototype)
    }

    public static find(): Finder<IExchangeType, ExchangeType> {
        return new Finder<IExchangeType, ExchangeType>(ExchangeType.TAG, ExchangeType.prototype)
    }
}