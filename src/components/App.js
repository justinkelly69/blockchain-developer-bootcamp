import React, { useEffect } from "react"
import { ethers } from "ethers"
import config from "../tmp/config.json"
import abi from "../tmp/Token.json"
import "../App.css"

function App() {

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    })
    console.log(accounts[0])

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await provider.getNetwork()
    console.log('chainId=', chainId)

    const address = config[chainId]['DAPP'].address
    const token = new ethers.Contract(address, abi, provider)
    console.log('address=', token.address)

    console.log('token=', token)

    const symbol = await token.symbol()
    console.log('symbol=', symbol)
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
