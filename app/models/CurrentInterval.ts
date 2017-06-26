import { BaseNode, IAttributes } from "../../database/connection";

interface ICurrentInterval extends IAttributes {
    fk_exchange_type: string
	fk_interval: string
	
}

export class CurrentInterval extends BaseNode<ICurrentInterval> {
    
    constructor(fields: ICurrentInterval) {
        super(fields, "current_intervals")
    }

}