const { ethers } = require("hardhat")

exports.tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether')

exports.wait = seconds => {
    const milliseconds = seconds * 100
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

exports.getAccounts = async () => {
    const accounts = await ethers.getSigners()
    return accounts
}

exports.deployExchange = async (exchange, address, feePercent) => {
    const excg = await exchange.deploy(address, feePercent)
    await excg.deployed()
    console.log(`Exchange deployed to: ${excg.address}`)
    return excg
}

exports.deployToken = async (token, name, abbr, maxTokens) => {
    const tkn = await token.deploy(name, abbr, maxTokens)
    await tkn.deployed()
    console.log(`${name} deployed to: ${tkn.address}`)
    return tkn
}

exports.fetchContract = async (name, address) => {
    const token = await ethers.getContractAt(name, address)
    console.log(`${name} fetched ${address}\n`)
    return token
}

exports.makeTransaction = async (token, sender, receiver, amount) => {
    await token.connect(sender).transfer(receiver.address, amount)
    const name = await token.name()
    console.log(`Transferred ${amount} ${name} from ${sender.address} to ${receiver.address}\n`)
}

// transaction = await mETH.connect(user2).approve(Exchange_address, amount)
exports.approveTransaction = async (token, user, exchange, amount) => {
    const transaction = await token.connect(user).approve(exchange.address, amount)
    await transaction.wait()
    const name = await token.name()
    console.log(`Approved ${amount} ${name} from ${user.address}\n`)
}

// transaction = await exchange.connect(user1).depositToken(DAPP_address, amount)
exports.depositToken = async (exchange, user, tokens, amount) => {
    const transaction = await exchange.connect(user).depositToken(tokens.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount}  from ${user.address}\n`)
}

// transaction = await exchange.connect(user1).makeOrder(mETH_address, tokens(100), DAPP_address, tokens(5))
exports.makeOrder = async (exchange, user, tokensGive, amountGive, tokensGet, amountGet) => {
    const transaction = await exchange.connect(user).makeOrder(tokensGive.address, amountGive, tokensGet.address, amountGet)
    result = await transaction.wait()
    console.log(`Make order from ${user.address}\n`)
    return result.events[0].args.id
}

// transaction = await exchange.connect(user1).cancelOrder(orderId)
exports.cancelOrder = async (exchange, user, orderId) => {
    const transaction = await exchange.connect(user).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user.address}\n`)
}

// transaction = await exchange.connect(user2).fillOrder(orderId)
exports.fillOrder = async (exchange, user1, user2, orderId) => {
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)
}