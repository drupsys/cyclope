import { BaseNode, IAttributes } from "../../database/connection";

interface IInterval extends IAttributes {
    timestamp: number
	open_value: number
	max_value: number
	min_value: number
	close_value: number
	volume: number
	fk_exchange_type: string
	
}

export class Interval extends BaseNode<IInterval> {
    
    constructor(fields: IInterval) {
        super(fields, "intervals")
    }

}