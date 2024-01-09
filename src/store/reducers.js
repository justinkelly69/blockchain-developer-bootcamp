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

        case types.ETHER_BALANCE_LOADED:
            return {
                ...state,
                balance: action.balance
            }

        default:
            return state
    }
}

const DEFAULT_TOKENS_STATE = {
    loaded: false,
    contracts: [],
    symbols: [],
}

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {

    switch (action.type) {

        case types.TOKEN_1_LOADED:
            return {
                ...state,
                loaded: true,
                contracts: [action.token],
                symbols: [action.symbol],
            }

        case types.TOKEN_2_LOADED:
            return {
                ...state,
                loaded: true,
                contracts: [...state.contracts, action.token],
                symbols: [...state.symbols, action.symbol],
            }

        default:
            return state
    }
}

export const exchange = (state = { loaded: false, contract: {} }, action) => {

    switch (action.type) {

        case types.EXCHANGE_LOADED:
            return {
                ...state,
                loaded: true,
                contract: action.exchange
            }

        default:
            return state
    }
}

