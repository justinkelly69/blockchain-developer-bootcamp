import { ethers } from "ethers"
import types from './types'

import Token_abi from '../tmp/Token_abi.json'
import Exchange_abi from '../tmp/Exchange_abi.json'
//import { provider } from "./reducers"

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
    exchange.on('Deposit', (token, user, amount, balance, event) => {
        dispatch({ type: types.TRANSFER_SUCCESS, event })
    })

    exchange.on('Withdraw', (token, user, amount, balance, event) => {
        dispatch({ type: types.TRANSFER_SUCCESS, event })
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

