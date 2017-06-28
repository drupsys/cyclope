import { Model, BelongsTo } from "../../database/connection";
import { ExchangeType } from "./ExchangeType"
import { Interval } from "./Interval"

export interface ICurrentInterval {
    fk_exchange_types?: string
	fk_intervals?: string
	
}

export class CurrentInterval extends Model<ICurrentInterval> {
    static readonly TAG = "exchange_types|intervals"
    
    constructor(fields: ICurrentInterval) {
        super(fields, CurrentInterval.TAG)
    }

}