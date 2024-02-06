import React from "react"
import { useSelector, useDispatch } from "react-redux"
import config from '../tmp/config.json'
import { loadTokens, loadProvider } from "../store/interactions"


const Markets = () => {
    const chainId = useSelector(state => state.provider.chainId)
    const dispatch = useDispatch()
    //const provider = loadProvider(dispatch)
    const provider = useSelector(state => state.provider.connection)

    const marketHandler = async (e) => {
        loadTokens(provider, (e.target.value).split(','), dispatch)
    }

    return (
        <div className='component exchange__markets'>
            <div className='component__header'>
                <h2>Select Market</h2>
            </div>
            {chainId && config[chainId] ? (
                <select name="markets" id="markets" onChange={marketHandler}>
                    <option value={`${config[chainId].DApp.address},${config[chainId].mETH.address}`}>
                        DApp / mETH
                    </option>
                    <option value={`${config[chainId].DApp.address},${config[chainId].mDAI.address}`}>
                        DApp / mDAI
                    </option>
                </select>
            ) : (
                <div>
                    <p>Not Deployed to Network</p>
                </div>
            )}

            <hr />
        </div>
    )
}

export default Markets;