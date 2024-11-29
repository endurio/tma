import {providers} from "ethers";
import { Symbiosis } from 'symbiosis-js-sdk'
export const symbiosis = new Symbiosis('mainnet', 'endurio.io')
export const ARB_PROVIDER = 'https://arbitrum.llamarpc.com'
export const JSONProvider = new providers.JsonRpcProvider(ARB_PROVIDER);
