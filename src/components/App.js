import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import config from "../tmp/config.json"
import { 
  loadProvider, 
  loadNetwork, 
  loadAccount, 
  loadTokens,
  loadExchange
} from "../store/interactions"

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    // Connect ethers to blockchain
    const provider = loadProvider(dispatch)

    // Fetch current network's chainId (hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch)

    // Fetch current account and balance from MetaMask
    await loadAccount(provider, dispatch)

    // Load tokens smart contracts
    const DAPP = config[chainId].DAPP
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DAPP.address, mETH.address], dispatch)

    // Load exchange contract
    const exchange = config[chainId].exchange
    await loadExchange(provider, exchange.address, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App
