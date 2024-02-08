import React, { useRef, useState } from "react"
import { useSelector } from "react-redux"

import sort from "../assets/sort.svg"
import { myFilledOrdersSelector, myOpenOrdersSelector } from "../store/selectors"
import Banner from "./Banner"

const Transactions = () => {

    const myOpenOrders = useSelector(myOpenOrdersSelector)
    const myFilledOrders = useSelector(myFilledOrdersSelector)
    const symbols = useSelector(state => state.tokens.symbols)

    const orderRef = useRef(null)
    const tradeRef = useRef(null)

    const [showMyOrders, setShowMyOrders] = useState(true)

    const tabHandler = (e) => {
        if (showMyOrders) {
            e.target.className = 'tab tab--active'
            orderRef.current.className = 'tab'
            setShowMyOrders(false)
        } else {
            e.target.className = 'tab'
            orderRef.current.className = 'tab tab--active'
            setShowMyOrders(true)
        }
    }

    return (
        <div className="component exchange__transactions">
            {showMyOrders ? (
                <div>
                    <div className='component__header flex-between'>
                        <h2>My Orders</h2>
                        <div className='tabs'>
                            <button ref={orderRef} onClick={tabHandler} className='tab tab--active'>Orders</button>
                            <button ref={tradeRef} onClick={tabHandler} className='tab'>Trades</button>
                        </div>
                    </div>

                    {!myOpenOrders || myOpenOrders.length === 0 ? (
                        <Banner text='No Open Orders' />
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>{symbols && symbols[0]} <img src={sort} alt="Sort" /></th>
                                    <th>{symbols && symbols[0]}/{symbols && symbols[1]} <img src={sort} alt="Sort" /></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOpenOrders && myOpenOrders.map((order, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className={order.orderTypeClass}>{order.token0Amount}</td>
                                            <td>{order.tokenPrice}</td>
                                            <td></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div>
                    <div className='component__header flex-between'>
                        <h2>My Transactions</h2>
                        <div className='tabs'>
                            <button ref={orderRef} onClick={tabHandler} className='tab'>Orders</button>
                            <button ref={tradeRef} onClick={tabHandler} className='tab tab--active'>Trades</button>
                        </div>
                    </div>

                    {!myFilledOrders || myFilledOrders.length === 0 ? (
                        <Banner text='No Trades' />
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Time <img src={sort} alt="Sort" /></th>
                                    <th>{symbols && symbols[0]} <img src={sort} alt="Sort" /></th>
                                    <th>{symbols && symbols[0]}/{symbols && symbols[1]} <img src={sort} alt="Sort" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {myFilledOrders && myFilledOrders.map((order, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{order.formattedTimestamp}</td>
                                            <td className={order.orderClass}>{order.orderSign}{order.token0Amount}</td>
                                            <td>{order.tokenPrice}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    )
}

export default Transactions;