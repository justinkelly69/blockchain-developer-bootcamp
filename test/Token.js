const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether')

const tokenData = {
    name: 'My Token',
    symbol: 'JKTKN',
    decimals: 18,
    totalSupply: '1000000',
}

describe('Token', () => {

    let token

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy(tokenData.name, tokenData.symbol, tokenData.totalSupply)
    })

    it('has correct name', async () => {
        expect(await token.name()).to.equal(tokenData.name)
    })

    it('has correct symbol', async () => {
        expect(await token.symbol()).to.equal(tokenData.symbol)
    })

    it('has correct decimals', async () => {
        expect(await token.decimals()).to.equal('18')
    })

    it('has correct totalSupply', async () => {
        expect(await token.totalSupply()).to.equal(tokens(tokenData.totalSupply))
    })
})