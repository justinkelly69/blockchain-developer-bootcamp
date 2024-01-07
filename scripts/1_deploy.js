const fs = require('fs')
const { getAccounts, deployExchange, deployToken, writeJSONFile } = require('./utils.js')

async function main() {
  const {chainId} = await ethers.provider.getNetwork()
  console.log(`Chain Id: ${chainId}\n`)

  console.log(`Preparing deployment....\n`)

  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')
  const configData = {
    [chainId]: {}
  }
  console.log(JSON.stringify(configData, null, 4))

  const accounts = await getAccounts()
  for(let account in accounts) {
    console.log(`${account} fetched: ${accounts[account].address}`)
  }
  
  const dapp = await deployToken(Token, 'DAPP University', 'DAPP', '1000000') 
  configData[chainId]['DAPP'] = {'address': dapp.address}

  const meth = await deployToken(Token, 'mETH', 'mETH', '1000000')
  configData[chainId]['mETH'] = {'address': meth.address}

  const mdai = await deployToken(Token, 'mDAI', 'mDAI', '1000000')
  configData[chainId]['mDAI'] = {'address': mdai.address}

  const exchange = await deployExchange(Exchange, accounts[1].address, 10)
  configData[chainId]['exchange'] = {'address': exchange.address}
  writeJSONFile('./src/tmp/config.json', configData)

  const Token_abi = require('../artifacts/contracts/Token.sol/Token.json').abi
  writeJSONFile('./src/tmp/Token_abi.json', Token_abi)

  const Exchange_abi = require('../artifacts/contracts/Exchange.sol/Exchange.json').abi
  writeJSONFile('./src/tmp/Exchange_abi.json', Exchange_abi)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error)
  process.exit(1)
});
