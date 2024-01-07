import types from './types'

export const provider = (state = {}, action) => {

    switch (action.type) {
        case types.PROVIDER_LOADED:
            return {
                ...state,
                connection: provider.connection
            }

        case types.NETWORK_LOADED:
            return {
                ...state,
                chainId: action.chainId
            }

        case types.ACCOUNT_LOADED:
            return {
                ...state,
                account: action.account
            }

        default:
            return state
    }
}

export const tokens = (state = { loaded: false, contract: null }, action) => {

    switch (action.type) {
        case types.TOKEN_LOADED:
            return {
                ...state,
                loaded: true,
                contract: action.token,
                symbol: action.symbol
            }

        default:
            return state
    }
}

