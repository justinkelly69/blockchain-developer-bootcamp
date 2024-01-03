const fs = require('fs')
const { getAccounts, deployExchange, deployToken } = require('./utils.js')

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

  const configStr = JSON.stringify(configData, null, 4)
  console.log(configStr)

  try {
    fs.writeFileSync('./tmp/config.json', configStr);
  } catch (err) {
    console.error(err);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error)
  process.exit(1)
});
