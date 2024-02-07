import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import config from "../tmp/config.json"
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents,
  loadAllOrders,
} from "../store/interactions"

import Navbar from "./Navbar"
import Markets from "./Markets"
import Balance from "./Balance"
import Order from "./Order"
import OrderBook from "./OrderBook"
import PriceChart from "./PriceChart"

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    // Connect ethers to blockchain
    const provider = loadProvider(dispatch)

    // Fetch current network's chainId (hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch)

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // Fetch current account and balance from MetaMask
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    // Load tokens smart contracts
    const DApp = config[chainId].DApp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DApp.address, mETH.address], dispatch)

    // Load exchange contract
    const exchangeConfig = config[chainId].exchange
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

    // Fetch all orders: opened, filled, cancelled
    loadAllOrders(provider, exchange, dispatch) 

    subscribeToEvents(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart />

          {/* Transactions */}

          {/* Trades */}

          <OrderBook />

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App
