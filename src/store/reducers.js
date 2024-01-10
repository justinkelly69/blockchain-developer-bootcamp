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

        case types.TOKEN_1_BALANCE_LOADED:
            return {
                ...state,
                balances: [action.balance],
            }

        case types.TOKEN_2_LOADED:
            return {
                ...state,
                loaded: true,
                contracts: [...state.contracts, action.token],
                symbols: [...state.symbols, action.symbol],
            }

        case types.TOKEN_2_BALANCE_LOADED:
            return {
                ...state,
                balances: [...state.balances, action.balance],
            }

        default:
            return state
    }
}

const DEFAULT_EXCHANGE_STATE = {
    loaded: false,
    contract: {},
    transaction: {
        isSuccessful: false
    },
    events: []
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {

    switch (action.type) {

        case types.EXCHANGE_LOADED:
            return {
                ...state,
                loaded: true,
                contract: action.exchange
            }

        //--------------------------------------------------
        // BALANCE CASES
        case types.EXCHANGE_TOKEN_1_BALANCE_LOADED:
            return {
                ...state,
                balances: [action.balance]
            }

        case types.EXCHANGE_TOKEN_2_BALANCE_LOADED:
            return {
                ...state,
                balances: [...state.balances, action.balance]
            }

        //--------------------------------------------------
        // TRANSFER CASES DEPOSITS & WITHDRAWALS
        case types.TRANSFER_REQUEST:
            return {
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: true,
                    isSuccessful: false,
                },
                transferInProgress: true,
            }

        case types.TRANSFER_SUCCESS:
            return {
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: true,
                },
                transferInProgress: false,
                events: [action.event, ...state.events],
            }


        case types.TRANSFER_FAIL:
            return {
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
                transferInProgress: false,
            }

        default:
            return state
    }
}

