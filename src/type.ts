import {ECPairInterface} from "ecpair";
import {HDNodeWallet} from "ethers";

export interface IWeb3Account {
    evmMnemonic?: string;
    evmAddress: string;
    evmPrivateKey: string;
    btcAddress: string;
    btcPublicKey: string;
    evmSigner: HDNodeWallet;
    btcSigner: ECPairInterface;
}