import React from "react"
import { useDispatch, useSelector } from "react-redux"
import Blockies from "react-blockies"
import logo from '../assets/logo.png'
import eth from '../assets/eth.svg'
import config from '../tmp/config.json'
import { loadAccount, loadProvider } from "../store/interactions"

const formatAccount = (account) => `${account.slice(0, 5)}...${account.slice(38, 42)}`

const Navbar = () => {

    const dispatch = useDispatch()

    //const provider = loadProvider(dispatch)
    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const account = useSelector(state => state.provider.account)
    const balance = useSelector(state => state.provider.balance)


    const connectHandler = async () => {
        await loadAccount(provider, dispatch)
    }

    const networkHandler = async (e) => {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: e.target.value }]
        })
    }

    return (
        <div className='exchange__header grid'>
            <div className='exchange__header--brand flex'>
                <img src={logo} className="logo" alt="DApp Token Exchange" />
                <h1>DAPP Token Exchange</h1>
            </div>

            <div className='exchange__header--networks flex'>
                <img src={eth} alt='ETH Logo' className="Eth Logo" />
                {chainId && (
                    <select name="network" id="network"
                        value={config[chainId] ? `0x${chainId.toString(16)}` : '0'} onChange={networkHandler}>
                        <option value='0' disabled>Select Network</option>
                        <option value='0x7a69'>Localhost</option>
                        <option value="0xaa36a7">Sepolia</option>
                    </select>
                )}
            </div>

            <div className='exchange__header--account flex'>
                {balance ? (
                    <p><small>My Balance</small>{Number(balance).toFixed(4)}</p>
                ) : (
                    <p><small>My Balance</small>0</p>
                )

                }
                {account ?
                    <>
                        <a href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : '#'}
                            target='_blank'
                            rel='noopener noreferrer'>
                            {formatAccount(account)}
                            <Blockies
                                seed={account}
                                className="identicon"
                                size={10}
                                scale={3}
                                color="#218730"
                                bgColor="#F1F2F9"
                                spotColor="#767F92"
                            />
                        </a>
                    </> :
                    <button
                        className="button"
                        onClick={connectHandler}
                    >
                        Connect
                    </button>
                }
            </div>
        </div>
    )
}

export default Navbar