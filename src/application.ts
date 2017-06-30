// import { Exchange, ExchangeType, Interval } from "./app/models";
// import { DatabaseConnection } from "./lib/database"

// import { suite, test, slow, timeout } from "mocha-typescript"

// // import * as chai from 'chai'
// // import * as sinon from 'sinon'

// function test1() {
//     let exchange = new Exchange({
//         name: "bitfinex"
//     })

//     exchange.exchangeTypes().push(new ExchangeType({
//         from: "BTC",
//         to: "USD"
//     }))
// }

// function test2() {
//     let exchange = new Exchange({
//         name: "bitfinex"
//     })

//     exchange.save()

//     exchange.exchangeTypes().push(new ExchangeType({
//         from: "BTC",
//         to: "USD"
//     }))
// }

// function test3() {
//     Exchange.find().byValue("name", "bitfinex").load((node: Exchange): void => {
//         node.exchangeTypes().push(new ExchangeType({
//             from: "BCU",
//             to: "USD"
//         }))

//         node.exchangeTypes().push(new ExchangeType({
//             from: "ETC",
//             to: "USD"
//         }))
//     })
// }

// function test4_1() {
//     let exchange = new Exchange({
//         name: "poloniex"
//     })

//     exchange.destroy()
// }

// function test4_2() {
//     let exchange = new Exchange({
//         name: "poloniex"
//     })
    
//     exchange.save()

//     exchange.exchangeTypes().push(new ExchangeType({
//         from: "BTC",
//         to: "USD"
//     }))

//     exchange.exchangeTypes().push(new ExchangeType({
//         from: "ETC",
//         to: "USD"
//     }))

//     exchange.exchangeTypes().destroy_all()
//     exchange.destroy()
// }

// function test5() {
//     Exchange.find().byValue("name", "bitfinex").load((node: Exchange): void => {
//         Exchange.find().byKey(node.id).load((e: Exchange): void => {
//             console.log(e)
//         })

//         node.exchangeTypes().load((et: ExchangeType[]): void => {
//             console.log(et)

//             et[0].exchange().load((node: Exchange): void => {
//                 console.log(node)
//             })
//         })
//     })
// }

// test5()

// ExchangeType.find().byKey("-Kne4rVrWCdsM-Y0c_AD").load((et: ExchangeType): void => {
    // et.exchange().load((e: Exchange): void => {
    //     console.log(e)
    // })

    // et.currentInterval().set(new Interval({
    //     open_value: 0,
    //     max_value: 0,
    //     min_value: 0,
    //     close_value: 0,
    //     volume: 0
    // }))

    // et.currentInterval().load((e: Interval): void => {
    //     console.log(e)
    // })

// })

// ExchangeType.find().all().load((et: ExchangeType[]): void => {
//     console.log(et)
// })

// ExchangeType.find().order("created_at").load((et: ExchangeType[]): void => {
//     console.log(et)
// })

// ExchangeType.find().byKey("-Kna07hBdAT4aKuuFIH_").destroy()