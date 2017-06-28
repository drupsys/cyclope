"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Exchange_1 = require("./app/models/Exchange");
const ExchangeType_1 = require("./app/models/ExchangeType");
function test1() {
    let exchange = new Exchange_1.Exchange({
        name: "bitfinex"
    });
    exchange.exchangeTypes().push(new ExchangeType_1.ExchangeType({
        from: "BTC",
        to: "USD"
    }));
}
function test2() {
    let exchange = new Exchange_1.Exchange({
        name: "bitfinex"
    });
    exchange.save();
    exchange.exchangeTypes().push(new ExchangeType_1.ExchangeType({
        from: "BTC",
        to: "USD"
    }));
}
function test3() {
    Exchange_1.Exchange.find().byValue("name", "bitfinex").load((node) => {
        node.exchangeTypes().push(new ExchangeType_1.ExchangeType({
            from: "BCU",
            to: "USD"
        }));
        node.exchangeTypes().push(new ExchangeType_1.ExchangeType({
            from: "ETC",
            to: "USD"
        }));
    });
}
function test4_1() {
    let exchange = new Exchange_1.Exchange({
        name: "poloniex"
    });
    exchange.destroy();
}
function test4_2() {
    let exchange = new Exchange_1.Exchange({
        name: "poloniex"
    });
    exchange.save();
    exchange.exchangeTypes().push(new ExchangeType_1.ExchangeType({
        from: "BTC",
        to: "USD"
    }));
    exchange.exchangeTypes().push(new ExchangeType_1.ExchangeType({
        from: "ETC",
        to: "USD"
    }));
    exchange.exchangeTypes().destroy_all();
    exchange.destroy();
}
function test5() {
    Exchange_1.Exchange.find().byValue("name", "bitfinex").load((node) => {
        Exchange_1.Exchange.find().byKey(node.id).load((e) => {
            console.log(e);
        });
        node.exchangeTypes().load((et) => {
            console.log(et);
            et[0].exchange().load((node) => {
                console.log(node);
            });
        });
    });
}
