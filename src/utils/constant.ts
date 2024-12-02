export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const WHITELIST_TOKEN: {[symbol: string]: {address: string, decimals: number}} = {
    USDC: {address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', decimals: 6},
    USDT: {address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', decimals: 18},
    ETH: {address: NATIVE_ADDRESS, decimals: 18}
}

export const SYMBIOSIS_URL_API='https://api.symbiosis.finance/crosschain/v1/swap'
export const WHITELIST_TOKEN_LIST: string[] = Object.keys(WHITELIST_TOKEN).map((symbol: any) => WHITELIST_TOKEN[symbol].address).filter(address => address !== NATIVE_ADDRESS)
export const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

// Style
export const ICONIFY_SIZE_SM = '16px'
export const ICONIFY_SIZE_MD = '24px'
export const ICONIFY_SIZE_LG = '32px'