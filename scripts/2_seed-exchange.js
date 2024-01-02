const { ethers } = require("hardhat")
const config = require('../src/config.json')

const DAPP_address = config["31337"]["DAPP"]["address"]  //'0x5FbDB2315678afecb367f032d93F642f64180aa3'
const mETH_address = config["31337"]["mETH"]["address"]  //'0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const mDAI_address = config["31337"]["mDAI"]["address"]  //'0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const Exchange_address = config["31337"]["exchange"]["address"]  //'0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'

const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether')

const wait = seconds => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
  const accounts = await ethers.getSigners()

  const DAPP = await ethers.getContractAt('Token', DAPP_address)
  console.log(`DAPP Token fetched ${DAPP_address}\n`)

  const mETH = await ethers.getContractAt('Token', mETH_address)
  console.log(`mETH Token fetched ${mETH_address}\n`)

  const mDAI = await ethers.getContractAt('Token', mDAI_address)
  console.log(`mDAI Token fetched ${mDAI_address}\n`)

  const exchange = await ethers.getContractAt('Exchange', Exchange_address)
  console.log(`Exchange fetched ${Exchange_address}\n`)

  const sender = accounts[0]
  const receiver = accounts[1]
  const amount = tokens(10000)

  let transaction, result
  transaction = await mETH.connect(sender).transfer(receiver.address, amount)
  console.log(`Transferred ${amount} mETH from ${sender.address} to ${receiver.address}\n`)

  const user1 = accounts[0]
  const user2 = accounts[1]

  transaction = await DAPP.connect(user1).approve(Exchange_address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} DAPP from ${user1.address}\n`)

  transaction = await exchange.connect(user1).depositToken(DAPP_address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} DAPP from ${user1.address}\n`)

  transaction = await mETH.connect(user2).approve(Exchange_address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} mETH from ${user2.address}\n`)

  transaction = await exchange.connect(user2).depositToken(mETH_address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} mETH from ${user2.address}\n`)

  let orderId

  /////////////////////////////////////////////////////////////
  // SEED A CANCELLED ORDER

  transaction = await exchange.connect(user1).makeOrder(mETH_address, tokens(100), DAPP_address, tokens(5))
  result = await transaction.wait()
  console.log(`Make order from ${user1.address}\n`)

  //console.log(result)
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  await wait(1)

  /////////////////////////////////////////////////////////////
  // SEED A FILLED ORDER

  transaction = await exchange.connect(user1).makeOrder(mETH_address, tokens(100), DAPP_address, tokens(10))
  result = await transaction.wait()
  console.log(`Make order from ${user1.address}\n`)

  //console.log(result)
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  await wait(1)

  transaction = await exchange.connect(user1).makeOrder(mETH_address, tokens(50), DAPP_address, tokens(15))
  result = await transaction.wait()
  console.log(`Make order from ${user1.address}\n`)

  //console.log(result)
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  await wait(1)

  transaction = await exchange.connect(user1).makeOrder(mETH_address, tokens(200), DAPP_address, tokens(20))
  result = await transaction.wait()
  console.log(`Make order from ${user1.address}\n`)

  //console.log(result)
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  await wait(1)

  /////////////////////////////////////////////////////////////
  // SEED OPEN ORDERS

  for (let i = 0; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mETH_address, tokens(10 * i), DAPP_address, tokens(10))
    result = await transaction.wait()
    console.log(`Make order from ${user1.address}\n`)

    await wait(1)
  }

  for (let i = 0; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(DAPP_address, tokens(10), mETH_address, tokens(10 * i))
    result = await transaction.wait()
    console.log(`Make order from ${user2.address}\n`)

    await wait(1)
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  });
