import { Model } from "../../lib/database"
import { BelongsTo } from "../../lib/database/finders/nodes"
import { ExchangeType, Interval } from "./"

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