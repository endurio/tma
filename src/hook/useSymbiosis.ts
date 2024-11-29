import {useWeb3Account} from "@/components/AccountManagement/hook/useWeb3Account"
import {JSONProvider} from "@/config"
import {BITCOIN_CHAIN_ID} from "@/utils/constant"
import {findSymbiosisTokens,swapCrossChain} from "@/utils/symbiosis"
import {useEffect} from "react"
import {ChainId} from "symbiosis-js-sdk"

export const useInitSymbiosis = () => {
    const {account} = useWeb3Account()
    useEffect(() => {
        const tokenIn = findSymbiosisTokens({tokenAddress: '', symbol: 'ETH', chainId: JSONProvider?._network?.chainId})[0]
        const tokenInAmount = String(0.1 * 10 ** tokenIn?.decimals || 18)
        if(tokenIn) tokenIn.isNative = true
        const tokenOut = findSymbiosisTokens({tokenAddress: '', symbol: 'ETH', chainId: ChainId.BTC_MAINNET})[0]
        if(account && tokenIn && tokenOut) {

            swapCrossChain({tokenIn, tokenOut, tokenInAmount, from: account?.evmAddress, to: account?.btcAddress  })
        }
    },[account])
}

