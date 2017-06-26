import { Exchange } from "./app/models/Exchange";
import { ExchangeType } from "./app/models/ExchangeType";
import { DatabaseConnection } from "./database/connection"

// let exchange = new Exchange({
//     name: "bitfinex"
// })

// exchange.save()

// let type = new ExchangeType({
//     pair: "BTCUSD",
//     from: "BTC",
//     to: "USD",
//     fk_exchange: exchange.id
// })

// type.save()

// let dc = DatabaseConnection.instance()
// dc.database().ref("/exchanges/-KnWewbLs5oTF2bS6XBW").once('value').then(function(snapshot) {
//   console.log(snapshot.val())
// });

// Exchange.find().byKey("-KnWewbLs5oTF2bS6XBW").commit((node: Exchange): void => {
//     let type = new ExchangeType({
//         pair: "ETHUSD",
//         from: "ETH",
//         to: "USD",
//         fk_exchange: node.id
//     })

//     type.save()
// })

// ExchangeType.find().byKey("-KnWewbW2iAsXAJrt41p").commit((et: ExchangeType): void => {
//     console.log(et)
//     et.exchange((e: Exchange): void => {
//         console.log(e)
//     })

//     et.exchange((e: Exchange): void => {
//         console.log(e)
//     })
// })

ExchangeType.find().all().commit((et: ExchangeType[]): void => {
    console.log(et)
})