import { createSelector } from "reselect"
import { get, groupBy, reject, minBy, maxBy } from "lodash"
import { ethers } from "ethers"
import moment from "moment"

const account = state => get(state, 'provider.account')
const tokens = state => get(state, 'tokens.contracts')
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
    const all = allOrders(state)
    const cancelled = cancelledOrders(state)
    const filled = filledOrders(state)

    const _openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
        const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())

        return (orderFilled || orderCancelled)
    })

    return _openOrders
}

//------------------------------------------------------------------------------
// ALL FILLED ORDERS

export const myOpenOrdersSelector = createSelector(
    account,
    tokens,
    openOrders,
    (account, tokens, orders) => {
        if (!tokens[0] || !tokens[1] || orders.length === 0) { return }

        orders = orders.filter((o) => o.user === account)
        orders = orders.filter(o => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter(o => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
        orders = decorateMyOpenOrders(orders, tokens)
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)

        return orders
    }
)

const decorateMyOpenOrders = (orders, tokens) => {
    return (
        orders.map(order => {
            order = decorateOrder(order, tokens)
            order = decorateMyOpenOrder(order, tokens)
            return order
        })
    )
}

const decorateMyOpenOrder = (order, tokens) => {
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return ({
        ...order,
        orderType,
        orderTypeClass: orderType === 'buy' ? 'green-text' : 'red-text'
    })
}

const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount

    if (order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGive
        token1Amount = order.amountGet
    }
    else {
        token0Amount = order.amountGet
        token1Amount = order.amountGive
    }

    const precision = 100000

    return ({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount, 'ether'),
        token1Amount: ethers.utils.formatUnits(token1Amount, 'ether'),
        tokenPrice: Math.round((token1Amount / token0Amount) * precision) / precision,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

//------------------------------------------------------------------------------
// ALL FILLED ORDERS

export const filledOrdersSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1] || orders.length === 0) { return }

        orders = orders.filter(o => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter(o => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // Step 1: sort orders by time ascending
        // Step 2: apply order colors (decorate orders)
        // Step 3: sort orders by time descending for UI

        orders = orders.sort((a, b) => a.timestamp - b.timestamp)
        orders = decorateFilledOrders(orders, tokens)
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)

        return orders
    }
)

//------------------------------------------------------------------------------
// My FILLED ORDERS

export const myFilledOrdersSelector = createSelector(
    account,
    tokens,
    filledOrders,
    (account, tokens, orders) => {
        if (!tokens[0] || !tokens[1] || orders.length === 0) { return }

        orders = orders.filter((o) => o.user === account || o.creator === account)
        orders = orders.filter(o => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter(o => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)
        orders = decorateMyFilledOrders(orders, account, tokens)

        return orders
    }
)

const decorateMyFilledOrders = (orders, account, tokens) => {
    return (
        orders.map(order => {
            order = decorateOrder(order, tokens)
            order = decorateMyFilledOrder(order, account, tokens)
            return order
        })
    )
}

const decorateMyFilledOrder = (order, account, tokens) => {
    const myOrder = order.creator === account
    let orderType

    if (myOrder) {
        orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    } else {
        orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'
    }

    return ({
        ...order,
        orderType,
        orderClass: (orderType === 'buy' ? 'buy-color' : 'sell-color'),
        orderSign: (orderType === 'buy' ? '+' : '-'),
    })
}

const decorateFilledOrders = (orders, tokens) => {
    let previousOrder = orders[0]

    return (
        orders.map(order => {
            order = decorateOrder(order, tokens)
            order = decorateFilledOrder(order, previousOrder)
            previousOrder = order
            return order
        })
    )
}

const decorateFilledOrder = (order, previousOrder) => {
    return ({
        ...order,
        tokenPriceClass: tokenPriceClass(order, order.id, previousOrder)
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    return previousOrder.id === orderId || previousOrder.tokenPrice <= tokenPrice ?
        'red-text' :
        'green-text'
}

const decorateOrderBookOrders = (orders, tokens) => {
    return (orders.map(order => {
        order = decorateOrder(order, tokens)
        order = decorateOrderBookOrder(order, tokens)
        return (order)
    }))
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return ({
        ...order,
        orderType,
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    })
}

export const orderBookSelector = createSelector(
    openOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }

        orders = orders.filter(o => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter(o => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
        orders = decorateOrderBookOrders(orders, tokens)
        orders = groupBy(orders, 'orderType')

        const buyOrders = get(orders, 'buy', [])
        const sellOrders = get(orders, 'sell', [])

        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
            sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
        }

        return orders
    }
)

//------------------------------------------------------------------------------
// PRICE CHART

export const priceChartSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1] || orders.length === 0) { return }

        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)
        orders = orders.map((o) => decorateOrder(o, tokens))

        const [secondLastOrder, lastOrder] = orders.slice(orders.length - 2)
        const lastPrice = get(lastOrder, 'tokenPrice', 0)
        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

        return ({
            lastPrice,
            lastPriceChange: (lastPrice >= secondLastPrice ? 'up' : 'down'),
            series: [{
                data: buildGraphData(orders)
            }]
        })
    }
)

const buildGraphData = (orders) => {
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())
    const hours = Object.keys(orders)

    const graphData = hours.map(hour => {
        const group = orders[hour]
        const open = group[0]
        const high = maxBy(group, 'tokenPrice')
        const low = minBy(group, 'tokenPrice')
        const close = group[group.length - 1]

        return ({
            x: new Date(hour),
            y: [
                open.tokenPrice,
                high.tokenPrice,
                low.tokenPrice,
                close.tokenPrice
            ]
        })
    })

    return graphData
}