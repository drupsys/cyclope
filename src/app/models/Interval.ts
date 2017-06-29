import { Model, Finder } from "../../lib/database"
import { BelongsTo } from "../../lib/database/finders/nodes"
import { ExchangeType, IExchangeType } from "./"

export interface IInterval {
	open_value: number
	max_value: number
	min_value: number
	close_value: number
	volume: number
	fk_exchange_types?: string
	
}

export class Interval extends Model<IInterval> {
    static readonly TAG = "intervals"
    
    constructor(fields: IInterval) {
        super(fields, Interval.TAG)
    }

	public exchangeType(): BelongsTo<IExchangeType, ExchangeType> {
		return this.belongsTo<IExchangeType, ExchangeType>(ExchangeType.TAG, ExchangeType.prototype, this.fields.fk_exchange_types)
	}

	public static find(): Finder<IInterval, Interval> {
        return new Finder<IInterval, Interval>(Interval.TAG, Interval.prototype)
    }
}