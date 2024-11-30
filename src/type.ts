import {ECPairInterface} from "ecpair";
import {BigNumber, Wallet} from "ethers";
import {ChainId, Icons} from "symbiosis-js-sdk";

export interface IWeb3Account {
    evmMnemonic?: string;
    evmAddress: string;
    evmPrivateKey: string;
    btcAddress: string;
    btcPublicKey: string;
    evmSigner: Wallet;
    btcSigner: ECPairInterface;
    balances: IWeb3AccountBalance
    allowances: IWeb3AccountAllowances
}

export type TokenConstructor = {
  name?: string
  symbol?: string
  address: string
  decimals: number
  chainId: ChainId
  isNative?: boolean
  chainFromId?: ChainId
  icons?: Icons
  userToken?: boolean
  deprecated?: boolean
}
export interface IWeb3AccountBalance {[tokenAddress: string]: BigNumber}
export interface IWeb3AccountAllowances {[tokenAddress: string]: {[spender: string]: BigNumber}} 
export type IWeb3OnChainState= {
    balances: {
      [token: string]: BigNumber;
    };
    allowances: {
      [token: string]: {
        [spender: string]: BigNumber;
      };
    };
};

export type SwapExactInResultResponse = {
  fee: {
    symbol: string
    icon: string
    address: string
    amount: string
    chainId: number
    decimals: number
  }
  route: Array<{
    symbol: string
    icon: string
    address: string
    chainId: number
    decimals: number
  }>
  inTradeType: string
  outTradeType: string
  fees: Array<{
    provider: string
    value: {
      symbol: string
      icon: string
      address: string
      amount: string
      chainId: number
      decimals: number
    }
    save: {
      symbol: string
      icon: string
      address: string
      amount: string
      chainId: number
      decimals: number
    }
    description: string
  }>
  routes: Array<{
    provider: string
    tokens: Array<{
      symbol: string
      icon: string
      address: string
      chainId: number
      decimals: number
    }>
  }>
  kind: string
  priceImpact: string
  tokenAmountOut: {
    symbol: string
    icon: string
    address: string
    amount: string
    chainId: number
    decimals: number
  }
  tokenAmountOutMin: {
    symbol: string
    icon: string
    address: string
    amount: string
    chainId: number
    decimals: number
  }
  amountInUsd: {
    symbol: string
    address: string
    amount: string
    chainId: number
    decimals: number
  }
  approveTo: string
  type: string
  rewards: Array<any>
  estimatedTime: number
  tx: {
    chainId: number
    data: string
    to: string
    value: string
  }
}
