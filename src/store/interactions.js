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
    dispatch({type: types.ETHER_BALANCE_LOADED, balance})

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


