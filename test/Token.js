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

    let token, accounts, deployer, receiver

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy(tokenData.name, tokenData.symbol, tokenData.totalSupply)

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
    })

    describe('Deployment', () => {
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

        it('assigns totalSupply to deployer', async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(tokens(tokenData.totalSupply))
        })
    })

    describe('Sending Tokens', () => {
        let amount, transaction, result

        describe('Success', () => {

            beforeEach(async () => {
                amount = tokens(100)
                //console.log('deployer.address', deployer.address)
                //console.log('receiver.address', receiver.address)
                transaction = await token.connect(deployer).transfer(receiver.address, amount)
                result = await transaction.wait()
            })

            it('Transfers token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens('999900'))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
            })

            it('Emits a transfer event', async () => {
                const event = result.events[0]
                //console.log(event)
                expect(event.event).to.equal('Transfer')

                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)

            })
        })

        describe('Failure', () => {
            let invalidAmount = tokens('100000000')

            it('rejects insufficient balances', async () => {
                transaction = await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
            })

            it('rejects invalid recipient', async () => {
                transaction = await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', invalidAmount)).to.be.reverted
            })
        })

    })
})

