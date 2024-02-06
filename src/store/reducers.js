import types from './types'

export const provider = (state = {}, action) => {

    switch (action.type) {
        case types.PROVIDER_LOADED:
            return {
                ...state,
                connection: action.connection
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
    allOrders: {
        loaded: false,
        data: []
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
        // ORDERS LOADED (CANCELLED, FILLED & ALL)

        case types.CANCELLED_ORDERS_LOADED:
            return {
                ...state,
                cancelledOrders: {
                    loaded: true,
                    data: action.cancelledOrders
                }
            }

        case types.FILLED_ORDERS_LOADED:
            return {
                ...state,
                filledOrders: {
                    loaded: true,
                    data: action.filledOrders
                }
            }

        case types.ALL_ORDERS_LOADED:
            return {
                ...state,
                allOrders: {
                    loaded: true,
                    data: action.allOrders
                }
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

        //--------------------------------------------------
        // MAKING ORDERS CASES

        case types.NEW_ORDER_REQUEST:
            return {
                ...state,
                transaction: {
                    transactionType: 'New Order',
                    isPending: true,
                    isSuccessful: false
                }
            }

        case types.NEW_ORDER_FAIL:
            return {
                ...state,
                transaction: {
                    transactionType: 'New Order',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                }
            }

        case types.NEW_ORDER_SUCCESS:

            const index = state.allOrders.data.findIndex(
                order => order.id === action.orderId
            )

            const data = index === -1 ?
                [...state.allOrders.data, action.order] :
                state.allOrders.data

            return {
                ...state,
                allOrders: {
                    ...state.allOrders,
                    data
                },
                transaction: {
                    transactionType: 'New Order',
                    isPending: false,
                    isSuccessful: true,
                },
                events: [action.event, ...state.events]
            }

        default:
            return state
    }
}

