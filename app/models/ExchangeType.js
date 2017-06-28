"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../../database/connection");
const Exchange_1 = require("./Exchange");
const Interval_1 = require("./Interval");
const CurrentInterval_1 = require("./CurrentInterval");
class ExchangeType extends connection_1.Model {
    constructor(fields) {
        super(fields, ExchangeType.TAG);
    }
    exchange() {
        return this.belongsTo(Exchange_1.Exchange.TAG, Exchange_1.Exchange.prototype, this.fields.fk_exchanges);
    }
    intervals() {
        return this.hasMany(Interval_1.Interval.TAG, Interval_1.Interval.prototype, ExchangeType.TAG);
    }
    currentInterval() {
        return this.hasOneThrough(CurrentInterval_1.CurrentInterval.TAG, CurrentInterval_1.CurrentInterval.prototype, Interval_1.Interval.prototype);
    }
    static find() {
        return new connection_1.Finder(ExchangeType.TAG, ExchangeType.prototype);
    }
}
ExchangeType.TAG = "exchange_types";
exports.ExchangeType = ExchangeType;
