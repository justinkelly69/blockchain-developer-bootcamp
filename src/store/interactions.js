import { ethers } from "ethers"
import types from './types'

import Token_abi from '../tmp/Token_abi.json'
import Exchange_abi from '../tmp/Exchange_abi.json'

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({ type: types.PROVIDER_LOADED, connection })

    return connection
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork()
    dispatch({ type: types.NETWORK_LOADED, chainId })

    return chainId
}

export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({ type: types.ACCOUNT_LOADED, account })

    let balance = await provider.getBalance(account)
    balance = ethers.utils.formatEther(balance)
    dispatch({ type: types.ETHER_BALANCE_LOADED, balance })

    return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol

    token = new ethers.Contract(addresses[0], Token_abi, provider)
    symbol = await token.symbol()
    dispatch({ type: types.TOKEN_1_LOADED, token, symbol })

    token = new ethers.Contract(addresses[1], Token_abi, provider)
    symbol = await token.symbol()
    dispatch({ type: types.TOKEN_2_LOADED, token, symbol })

    return token
}

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, Exchange_abi, provider)
    dispatch({ type: types.EXCHANGE_LOADED, exchange })

    return exchange
}

export const subscribeToEvents = (exchange, dispatch) => {

    exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        console.log('Cancel', JSON.stringify(event.args, null, 4))
        const order = event.args
        dispatch({ type: types.ORDER_CANCEL_SUCCESS, order, event })
    })

    exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {
        console.log('Trade', JSON.stringify(event.args, null, 4))
        const order = event.args
        dispatch({ type: types.ORDER_FILL_SUCCESS, order, event })
    })

    exchange.on('Deposit', (token, user, amount, balance, event) => {
        console.log('Deposit', JSON.stringify(event.args, null, 4))
        dispatch({ type: types.TRANSFER_SUCCESS, event })
    })

    exchange.on('Withdraw', (token, user, amount, balance, event) => {
        console.log('Withdraw', JSON.stringify(event.args, null, 4))
        dispatch({ type: types.TRANSFER_SUCCESS, event })
    })

    exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        console.log('Order', JSON.stringify(event.args, null, 4))
        const order = event.args
        dispatch({ type: types.NEW_ORDER_SUCCESS, order, event })
    })
}

//------------------------------------------------------------------------------
// LOAD USER BALANCES (WALLET AND EXCHANGE BALANCES)

export const loadBalances = async (exchange, tokens, account, dispatch) => {
    let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
    dispatch({ type: types.TOKEN_1_BALANCE_LOADED, balance })

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
    dispatch({ type: types.EXCHANGE_TOKEN_1_BALANCE_LOADED, balance })

    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
    dispatch({ type: types.TOKEN_2_BALANCE_LOADED, balance })

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
    dispatch({ type: types.EXCHANGE_TOKEN_2_BALANCE_LOADED, balance })
}

//------------------------------------------------------------------------------
// LOAD ALL ORDERS

export const loadAllOrders = async (provider, exchange, dispatch) => {
    const block = await provider.getBlockNumber()

    const cancelStream = await exchange.queryFilter('Cancel', 0, block)
    const cancelledOrders = cancelStream.map(event => event.args)

    dispatch({type: types.CANCELLED_ORDERS_LOADED, cancelledOrders})

    const tradeStream = await exchange.queryFilter('Trade', 0, block)
    const filledOrders = tradeStream.map(event => event.args)

    dispatch({type: types.FILLED_ORDERS_LOADED, filledOrders})

    const orderStream = await exchange.queryFilter('Order', 0, block)
    const allOrders = orderStream.map(event => event.args)

    dispatch({type: types.ALL_ORDERS_LOADED, allOrders})
}

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
    let transaction

    try {
        const signer = await provider.getSigner()
        const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)

        if (transferType === 'Deposit') {
            transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
            await transaction.wait()
            transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
            await transaction.wait()
        }
        else if (transferType === 'Withdraw') {
            transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
            await transaction.wait()
        }
    }
    catch (error) {
        dispatch({ type: types.TRANSFER_FAIL })
    }
}

export const makeBuyOrder = async (provider, exchange, tokens, order, dispatch) => {
    const tokenGet = tokens[0].address
    const tokenGive = tokens[1].address
    const amountGet = ethers.utils.parseUnits(order.amount.toString(), 18)
    const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)

    dispatch({ type: types.NEW_ORDER_REQUEST })

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    }
    catch (error) {
        dispatch({ type: types.NEW_ORDER_FAIL })
    }
}

export const makeSellOrder = async (provider, exchange, tokens, order, dispatch) => {
    const tokenGet = tokens[1].address
    const tokenGive = tokens[0].address
    const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)
    const amountGive = ethers.utils.parseUnits(order.amount.toString(), 18)

    dispatch({ type: types.NEW_ORDER_REQUEST })

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    }
    catch (error) {
        dispatch({ type: types.NEW_ORDER_FAIL })
    }
}



//------------------------------------------------------------------------------
// CANCEL ORDERS

export const cancelOrder = async (provider, exchange, order, dispatch) => {

    dispatch({ type: types.ORDER_CANCEL_REQUEST })

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).cancelOrder(order.id)
        await transaction.wait()
    }
    catch (error) {
        dispatch({ type: types.ORDER_CANCEL_FAIL })
    }
}

//------------------------------------------------------------------------------
// FILL ORDERS

export const fillOrder = async (provider, exchange, order, dispatch) => {

    dispatch({ type: types.ORDER_FILL_REQUEST })

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).fillOrder(order.id)
        await transaction.wait()
    }
    catch (error) {
        dispatch({ type: types.ORDER_FILL_FAIL })
    }
}




