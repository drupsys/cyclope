"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../../database/connection");
class CurrentInterval extends connection_1.Model {
    constructor(fields) {
        super(fields, CurrentInterval.TAG);
    }
}
CurrentInterval.TAG = "exchange_types|intervals";
exports.CurrentInterval = CurrentInterval;
