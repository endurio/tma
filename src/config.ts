import {providers} from "ethers";
import {Symbiosis} from 'symbiosis-js-sdk';
export const symbiosis = new Symbiosis('mainnet', 'endurio.io')
export const ARB_PROVIDER = 'https://arbitrum.llamarpc.com'
export const JSONProvider = new providers.JsonRpcProvider(ARB_PROVIDER);

// export const client = new BlockchainClient({
//     inBrowser: true,
//     chain: 'bitcoin',
//     key: 'c25da05051e34fc084d219d7687a5b14',
//     network: 'mainnet',
// })