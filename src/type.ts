import {ECPairInterface} from "ecpair";
import {Wallet} from "ethers";

export interface IWeb3Account {
    evmMnemonic?: string;
    evmAddress: string;
    evmPrivateKey: string;
    btcAddress: string;
    btcPublicKey: string;
    evmSigner: Wallet;
    btcSigner: ECPairInterface;
}