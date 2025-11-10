class OrderBook {
    constructor(symbol = "BITCUSD") {
        this.symbol = symbol,
            this.bids = [],
            this.ask = [],
            this._nextId = 1,
            this.lastTradedPrice = null
    }
    // helper
    _genOrderId() {
        return this._nextId++;
    }

    _sort(sides) {
        if (sides === "BUY") {
            this.bids.sort((a, b) => {
                if (a.price != b.price) {
                    return b.price - a.price
                }
                return a.timestamp - b.timestamp;
            })
        } else {
            this.ask.sort((a, b) => {
                if (a.price != b.price) {
                    return a.price - b.price
                }
                return a.timestamp - b.timestamp;
            })

        }
    }

    // function to place a new order in orderbook
    /*
    1. Create new order {orderId, side, type, price?, originqty, remainingqty, execQty, timeStamp, user}
    2. match type if type=market, call marketmatch, else call limit_match
    */
    placeOrder(side, type, price = null, quantity, user) {
        /*Basic validation*/
        let order = {
            orderId: this._genOrderId(),
            symbol: this.symbol,
            side: side,
            type: type,
            price: price,
            orignQty: quantity,
            remainQty: quantity,
            execQty: 0,
            timestamp: Date.now(),
            user: user
        }
        // let trades = []
        if (type === "MARKET") {
            let result = this._marketMatch(order)
            if (result.remainQty > 0) {
                console.log("Order completed: " + result.execQty + " Order Cancelled: " + result.remainQty)
            }
        } else {
            let result = this._limitMatch(order)
        }

    }

    // execute order if it is a market order
    /*
     bids: [] sorted desc
     asks: [] sorted asc
     1. type: buy | sell
     2. if buy start buying from asks array, starting from index 0
        loop while order.remainingQty>0 && asks.length>0
        buy min(order.reaminingQty, asks[0].remainingQty)
        update remainingQty and executedqty from both sides
    */
    _marketMatch(order) {
        if (type === "BUY") {
            let askArr = this.ask
            let top = ask[0]
            while (order.remainQty > 0 && this.ask.length > 0) {
                let orderfill = Math.min(order.remainQty, top.remainQty);
                order.execQty = order.execQty + orderfill,
                    order.remainQty = order.remainQty - orderfill

                top.execQty = top.execQty + orderfill
                top.remainQty = top.remainQty - orderfill

                // assume order.remaining > 0
                if (top.remainQty == 0) {
                    askArr.shift()
                }
            }
            return { order }
        } else if (order.side === "SELL") {
            const bidArr = this.bids;
            while (order.remainQty > 0 && bidArr.length > 0) {
                let top = bidArr[0];
                let fill = Math.min(order.remainQty, top.remainQty);

                order.execQty += fill;
                order.remainQty -= fill;
                top.execQty += fill;
                top.remainQty -= fill;
                this.lastTradedPrice = top.price;

                if (top.remainQty === 0) {
                    bidArr.shift();
                }
            }
        }
        return { order }

    }

    // execute order if it is a limit order
    _limitMatch(order) {
        if (order.side === "BUY") {
            let opposite = this.ask
            while (order.remainQty > 0 && opposite.length > 0) {
                let top = opposite[0]
                if (order.price >= top.price) {
                    let filledOrder = Math.min(order.remainQty, top.remainQty);
                    order.remainQty -= filledOrder
                    order.execQty += filledOrder

                    top.remainQty -= filledOrder
                    top.execQty += filledOrder
                    if (top.remainQty <= 0) {
                        opposite.shift();
                    }
                }
            }
            if (order.remainQty >= 0) {
                this.bids.push(order)
                this._sort("BUY")
            }
        } else if (order.side === "SELL") {
            let opposite = this.bids
            while (order.remainQty > 0 && opposite.length > 0) {
                let top = opposite[0]
                if (order.price <= top.price) {
                    let filledOrder = Math.min(order.remainQty, top.remainQty);
                    order.remainQty -= filledOrder
                    order.execQty += filledOrder

                    top.remainQty -= filledOrder
                    top.execQty += filledOrder
                    if (top.remainQty <= 0) {
                        opposite.shift();
                    }
                } else {
                    break;
                }
            }
            if (order.remainQty >= 0) {
                this.ask.push(order)
                this._sort("SELL")
            }
        }
    }

    getBookSnapShot() {
        return {
            lastUpdated: Date.now(),
            bids: this.bids.map((o) => [o.price, o.remainQty]),
            ask: this.ask.map((o) => [o.price, o.remainQty]),
            // currentprice: 
        }
    }
}

// if a function or variable start with _ (private)
// let orderBook = new OrderBook("BITCUSD")
let BITCUSDOrderBook = new OrderBook()
// fill bids as market maker,

console.log(BITCUSDOrderBook.getBookSnapShot())
BITCUSDOrderBook.placeOrder("BUY", "LIMIT", "1506.00", 10, "Sharma")
BITCUSDOrderBook.placeOrder("BUY", "LIMIT", "1505.00", 20, "Kumar")
BITCUSDOrderBook.placeOrder("BUY", "LIMIT", "1500.00", 10, "Yash")
console.log(BITCUSDOrderBook.getBookSnapShot())

// fill ask as market maker

console.log(BITCUSDOrderBook.getBookSnapShot())
BITCUSDOrderBook.placeOrder("SELL", "LIMIT", "1507.00", 10, "Yash")
BITCUSDOrderBook.placeOrder("SELL", "LIMIT", "1508.00", 10, "Kumar")
BITCUSDOrderBook.placeOrder("SELL", "LIMIT", "1509.00", 10, "Sharma")
console.log(BITCUSDOrderBook.getBookSnapShot())

// BITCUSDOrderBook._sort("BUY")
// console.log(BITCUSDOrderBook.bids)



// BITCUSDOrderBook._sort("ASK")
// console.log(BITCUSDOrderBook.ask)
// console.log(BITCUSDOrderBook.bids)
// console.log(BITCUSDOrderBook.getBookSnapShot());
// BITCUSDOrderBook.placeOrder("BUY", "MARKET", "1500", 10, "Yash")
// console.log(BITCUSDOrderBook.getBookSnapShot());