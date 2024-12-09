import {networks} from "bitcoinjs-lib"
import {ChainId} from "symbiosis-js-sdk"

export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const WHITELIST_TOKEN: {[symbol: string]: {address: string, decimals: number, chainId: ChainId}} = {
    USDC: {address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', decimals: 6, chainId: ChainId.ARBITRUM_MAINNET},
    USDT: {address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, chainId: ChainId.ARBITRUM_MAINNET},
    ETH: {address: NATIVE_ADDRESS, decimals: 18, chainId: ChainId.ARBITRUM_MAINNET},
    BTC: {address: "0xc102C66D4a1e1865Ee962084626Cf4c27D5BFc74", decimals: 8, chainId: ChainId.BTC_MAINNET}
}
export const WHITELIST_FETCH_PRICES_TOKEN_GECKO_NETWORK ='arbitrum'
export const WHITELIST_FETCH_PRICES_TOKEN_GECKO: {[symbol: string]: string} = {
    BTC: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    ETH: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    USDT: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    USDC: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
}
export const SYMBIOSIS_URL_API='https://api.symbiosis.finance/crosschain/v1/swap'
export const WHITELIST_TOKEN_LIST: string[] = Object.keys(WHITELIST_TOKEN).map((symbol: any) => WHITELIST_TOKEN[symbol].address).filter(address => address !== NATIVE_ADDRESS && address !== WHITELIST_TOKEN['BTC'].address)
export const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

export const FONT_SIZE_SM = '16px'
export const FONT_SIZE_MD = '24px'
export const FONT_SIZE_LG = '32px'

export const BITCOIN_TESTNET = 'testnet4'
