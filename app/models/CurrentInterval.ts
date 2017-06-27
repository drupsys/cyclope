import { Model, BelongsTo } from "../../database/connection";
import { ExchangeType } from "./ExchangeType"
import { Interval } from "./Interval"

interface ICurrentInterval {
    fk_exchange_type?: string
	fk_interval?: string
	
}

export class CurrentInterval extends Model<ICurrentInterval> {
    static readonly TAG = "exchange_types|intervals"
    
    constructor(fields: ICurrentInterval) {
        super(fields, CurrentInterval.TAG)
    }

    public exchangeType(): BelongsTo<ExchangeType> {
        return this.belongsTo<ExchangeType>(ExchangeType.TAG, ExchangeType.prototype, this.fields.fk_exchange_type)
    }

    public interval(): BelongsTo<Interval> {
        return this.belongsTo<Interval>(Interval.TAG, Interval.prototype, this.fields.fk_interval)
    }

}