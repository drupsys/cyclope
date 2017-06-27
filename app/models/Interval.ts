import { Model, Finder, BelongsTo } from "../../database/connection";
import { ExchangeType } from "./ExchangeType"

interface IInterval {
	open_value: number
	max_value: number
	min_value: number
	close_value: number
	volume: number
	fk_exchange_type?: string
	
}

export class Interval extends Model<IInterval> {
    static readonly TAG = "intervals"
    
    constructor(fields: IInterval) {
        super(fields, Interval.TAG)
    }

	public exchangeType(): BelongsTo<ExchangeType> {
		return this.belongsTo<ExchangeType>(ExchangeType.TAG, ExchangeType.prototype, this.fields.fk_exchange_type)
	}

	public static find(): Finder<Interval> {
        return new Finder<Interval>(Interval.TAG, Interval.prototype)
    }
}