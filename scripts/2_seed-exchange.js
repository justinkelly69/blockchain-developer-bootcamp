const { ethers } = require("hardhat")


const { tokens, wait, fetchContract, makeTransaction, approveTransaction, depositToken, 
  makeOrder, cancelOrder, fillOrder } = require('./utils.js')

async function main() {
  const accounts = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()
  const config = require('../src/tmp/config.json')
  
  const DApp = await fetchContract('Token', config[chainId]["DApp"]["address"])
  const mETH = await fetchContract('Token', config[chainId]["mETH"]["address"])
  const mDAI = await fetchContract('Token', config[chainId]["mDAI"]["address"])
  const exchange = await fetchContract('Exchange', config[chainId]["exchange"]["address"])

  const sender = accounts[0]
  const receiver = accounts[1]
  const amount = tokens(10000)

  let transaction, result
  await makeTransaction(mETH, sender, receiver, amount)

  const user1 = accounts[0]
  const user2 = accounts[1]

  await approveTransaction(DApp, user1, exchange, amount)
  await depositToken(exchange, user1, DApp, amount)
  await approveTransaction(mETH, user2, exchange, amount)
  await depositToken(exchange, user2, mETH, amount)

  let orderId

  /////////////////////////////////////////////////////////////
  // SEED A CANCELLED ORDER

  orderId = await makeOrder(exchange, user1, mETH, tokens(100), DApp, tokens(5))
  await cancelOrder(exchange, user1, orderId)
  await wait(1)

  /////////////////////////////////////////////////////////////
  // SEED A FILLED ORDER

  orderId = await makeOrder(exchange, user1, mETH, tokens(100), DApp, tokens(10))
  await fillOrder(exchange, user1, user2, orderId)
  await wait(1)

  orderId = await makeOrder(exchange, user1, mETH, tokens(50), DApp, tokens(15))
  await fillOrder(exchange, user1, user2, orderId)
  await wait(1)

  orderId = await makeOrder(exchange, user1, mETH, tokens(200), DApp, tokens(20))
  await fillOrder(exchange, user1, user2, orderId)
  await wait(1)

  /////////////////////////////////////////////////////////////
  // SEED OPEN ORDERS

  for (let i = 0; i <= 10; i++) {
    await makeOrder(exchange, user1, mETH, tokens(10 * i), DApp, tokens(10))
    await wait(0.1)
  }

  for (let i = 0; i <= 10; i++) {
    await makeOrder(exchange, user2, DApp, tokens(10), mETH, tokens(10 * i))
    await wait(0.1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  });
