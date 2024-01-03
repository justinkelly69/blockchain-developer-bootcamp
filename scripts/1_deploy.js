const fs = require('fs')

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

  const accounts = await ethers.getSigners()
  console.log(`Accounts fetched: ${accounts[0].address}, ${accounts[1].address}\n`)

  const dapp = await Token.deploy('DAPP University', 'DAPP', '1000000')
  await dapp.deployed()
  console.log(`DAPP deployed to: ${dapp.address}`)
  configData[chainId]['DAPP'] = {'address': dapp.address}

  const meth = await Token.deploy('mETH', 'mETH', '1000000')
  await meth.deployed()
  console.log(`mETH deployed to: ${meth.address}`)
  configData[chainId]['mETH'] = {'address': meth.address}

  const mdai = await Token.deploy('mDAI', 'mDAI', '1000000')
  await mdai.deployed()
  console.log(`mDAI deployed to: ${mdai.address}`)
  configData[chainId]['mDAI'] = {'address': mdai.address}

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange deployed to: ${exchange.address}`)
  configData[chainId]['exchange'] = {'address': exchange.address}

  const configStr = JSON.stringify(configData, null, 4)
  console.log(configStr)

  try {
    fs.writeFileSync('./tmp/config.json', configStr);
    // file written successfully
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
