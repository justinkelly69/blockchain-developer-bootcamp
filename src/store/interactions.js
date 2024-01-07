import { ethers } from "ethers"
import types from './types'

import Token_abi from '../tmp/Token_abi.json'

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

export const loadAccount = async (dispatch) => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({ type: types.ACCOUNT_LOADED, account })

    return account
}

export const loadToken = async (provider, address, dispatch) => {
    const token = new ethers.Contract(address, Token_abi, provider)
    const symbol = await token.symbol()
    dispatch({type: types.TOKEN_LOADED, token, symbol})
    
    return token
}



