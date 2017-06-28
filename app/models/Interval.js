"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../../database/connection");
const ExchangeType_1 = require("./ExchangeType");
class Interval extends connection_1.Model {
    constructor(fields) {
        super(fields, Interval.TAG);
    }
    exchangeType() {
        return this.belongsTo(ExchangeType_1.ExchangeType.TAG, ExchangeType_1.ExchangeType.prototype, this.fields.fk_exchange_types);
    }
    static find() {
        return new connection_1.Finder(Interval.TAG, Interval.prototype);
    }
}
Interval.TAG = "intervals";
exports.Interval = Interval;
