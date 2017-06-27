import { Exchange } from "./app/models/Exchange";
import { ExchangeType } from "./app/models/ExchangeType";
import { Interval } from "./app/models/Interval";
import { DatabaseConnection } from "./database/connection"

// let exchange = new Exchange({
//     name: "poloniex"
// })

// exchange.save()

// let type = new ExchangeType({
//     pair: "BTCUSD",
//     from: "BTC",
//     to: "USD",
//     fk_exchange: exchange.id
// })

// type.save()

// type = new ExchangeType({
//     pair: "BCUUSD",
//     from: "BCU",
//     to: "USD",
//     fk_exchange: exchange.id
// })

// type.save()

// let dc = DatabaseConnection.instance()
// dc.database().ref("/exchanges/-KnWewbLs5oTF2bS6XBW").once('value').then(function(snapshot) {
//   console.log(snapshot.val())
// });

// Exchange.find().byKey("-KnWewbLs5oTF2bS6XBW").load((node: Exchange): void => {
//     let type = new ExchangeType({
//         pair: "BTCUSD",
//         from: "BTC",
//         to: "USD",
//         fk_exchange: node.id
//     })
    
//     // type.save()

//     // type = new ExchangeType({
//     //     pair: "ETHUSD",
//     //     from: "ETH",
//     //     to: "USD",
//     //     fk_exchange: node.id
//     // })

//     // type.save()

//     // type = new ExchangeType({
//     //     pair: "BCUUSD",
//     //     from: "BCU",
//     //     to: "USD",
//     //     fk_exchange: node.id
//     // })

//     // type.save()

//     // console.log(node)

//     node.exchangeTypes().load((et: ExchangeType[]): void => {
//         console.log(et)
//     })

//     // node.exchangeTypes().push(type)

//     // node.exchangeTypes().destroy_all()

// })

ExchangeType.find().byKey("-Kne4rVrWCdsM-Y0c_AD").load((et: ExchangeType): void => {
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

    et.currentInterval().loadThrough((e: Interval): void => {
        console.log(e)
    })

})

// ExchangeType.find().all().load((et: ExchangeType[]): void => {
//     console.log(et)
// })

// ExchangeType.find().order("created_at").load((et: ExchangeType[]): void => {
//     console.log(et)
// })

// ExchangeType.find().byKey("-Kna07hBdAT4aKuuFIH_").destroy()