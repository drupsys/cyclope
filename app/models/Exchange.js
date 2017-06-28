"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../../database/connection");
const ExchangeType_1 = require("./ExchangeType");
class Exchange extends connection_1.Model {
    constructor(fields) {
        super(fields, Exchange.TAG);
    }
    exchangeTypes() {
        return this.hasMany(ExchangeType_1.ExchangeType.TAG, ExchangeType_1.ExchangeType.prototype, Exchange.TAG);
    }
    static find() {
        return new connection_1.Finder(Exchange.TAG, Exchange.prototype);
    }
}
Exchange.TAG = "exchanges";
exports.Exchange = Exchange;
