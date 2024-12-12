import {ECPairInterface} from "ecpair";
import {BigNumber, Wallet} from "ethers";
import {ChainId, Icons} from "symbiosis-js-sdk";

export interface IWeb3Account {
    evmMnemonic?: string;
    evmAddress: string;
    evmPrivateKey: string;
    btcAddress: string;
    btcNonSegwitAddress: string;
    evmSigner: Wallet;
    btcSigner: ECPairInterface;
    balances: IWeb3AccountBalance;
    btcBalance?: number;
    btcDisplayBalance?: number;
    btcUTXOs: IWeb3AccountUTXO[];
    allowances: IWeb3AccountAllowances;
}


export type TokenConstructor = {
  name?: string
  symbol?: string
  amount?: string
  address: string
  decimals: number
  chainId: ChainId
  isNative?: boolean
  chainFromId?: ChainId
  icons?: Icons
  userToken?: boolean
  deprecated?: boolean
}
export interface IWeb3AccountUTXO {
  txid: string; // Transaction ID
  vout: number; // Output index in the transaction
  recipients?: IBitcoinBlockTx[];
  status: {
    confirmed: boolean; // Whether the transaction is confirmed
    block_height: number; // Block height where the transaction is included
    block_hash: string; // Hash of the block containing the transaction
    block_time: number; // Timestamp of the block (Unix time)
  };
  rawTxHex?:string;
  value: number; // Value in satoshis
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


export type IBitcoinBlockDetail = {
  id: string
  height: number
  version: number
  timestamp: number
  bits: number
  nonce: number
  difficulty: number
  merkle_root: string
  tx_count: number
  size: number
  weight: number
  previousblockhash: string
  mediantime: number
  extras: {
    totalFees: number
    medianFee: number
    feeRange: Array<number>
    reward: number
    pool: {
      id: number
      name: string
      slug: string
      minerNames: any
    }
    avgFee: number
    avgFeeRate: number
    coinbaseRaw: string
    coinbaseAddress: string
    coinbaseAddresses: Array<string>
    coinbaseSignature: string
    coinbaseSignatureAscii: string
    avgTxSize: number
    totalInputs: number
    totalOutputs: number
    totalOutputAmt: number
    medianFeeAmt: number
    feePercentiles: Array<number>
    segwitTotalTxs: number
    segwitTotalSize: number
    segwitTotalWeight: number
    header: string
    utxoSetChange: number
    utxoSetSize: number
    totalInputAmt: number
    virtualSize: number
    firstSeen: any
    orphans: Array<any>
    matchRate: any
    expectedFees: any
    expectedWeight: any
  }
  txs: string[]
}

export type IBitcoinBlockDetails = {[blockKey: string]: IBitcoinBlockDetail} // blockHeigh-blockhash
export type IBitcoinBlockTxs = IBitcoinBlockTx[]

export type IBitcoinBlockTx = {
  txid: string
  version: number
  rawTxHex?: string;
  locktime: number
  vin: Array<{
    txid: string
    vout: number
    prevout?: {
      scriptpubkey: string
      scriptpubkey_asm: string
      scriptpubkey_type: string
      scriptpubkey_address: string
      value: number
    }
    scriptsig: string
    scriptsig_asm: string
    is_coinbase: boolean
    sequence: number
    inner_redeemscript_asm?: string
  }>
  vout: Array<{
    scriptpubkey: string
    scriptpubkey_asm: string
    scriptpubkey_type: string
    scriptpubkey_address: string
    value: number
  }>
  size: number
  weight: number
  sigops: number
  fee: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
}

export type IBitcoinTxMerkleProof = {
  block_height: number
  merkle: Array<string>
  pos: number
}


export type ITokensPrice = {[symbol: string]: number}


export interface IConfigs {
  UUPSVoid: string
  ERC1967Proxy: string
  ProxyPoR: string
  ProxyRefNet: string
  ProxyBrands: string
  Endurio: string
  Vault: string
  PoR: string
  RefNet: string
}


export type IParamSubmit = {
  // brand
  payer: string; // Solidity `address` maps to `string`

  // block
  header: Uint8Array; // Solidity `bytes` maps to `Uint8Array`
  merkleIndex: number; // Solidity `uint32` maps to `number`
  merkleProof: Uint8Array; // Solidity `bytes` maps to `Uint8Array`

  // tx
  version: number; // Solidity `uint32` maps to `number`
  locktime: number; // Solidity `uint32` maps to `number`
  vin: Uint8Array; // Solidity `bytes` maps to `Uint8Array`
  vout: Uint8Array; // Solidity `bytes` maps to `Uint8Array`

  // PoR
  inputIndex: number; // Solidity `uint32` maps to `number`
  memoLength: number; // Solidity `uint32` maps to `number`
  pubkeyPos: number; // Solidity `uint32` maps to `number`
};

export type IParamOutpoint = {
  // tx
  version: number; // Solidity `uint32` maps to `number`
  locktime: number; // Solidity `uint32` maps to `number`
  vin: Uint8Array; // Solidity `bytes` maps to `Uint8Array`
  vout: Uint8Array; // Solidity `bytes` maps to `Uint8Array`

  pkhPos: number; // Solidity `uint32` maps to `number`
};

export type IParamBounty = {
  // block
  header: Uint8Array; // Solidity `bytes` maps to `Uint8Array`
  merkleIndex: number; // Solidity `uint32` maps to `number`
  merkleProof: Uint8Array; // Solidity `bytes` maps to `Uint8Array`

  // tx
  version: number; // Solidity `uint32` maps to `number`
  locktime: number; // Solidity `uint32` maps to `number`
  vin: Uint8Array; // Solidity `bytes` maps to `Uint8Array`
  vout: Uint8Array; // Solidity `bytes` maps to `Uint8Array`
};

export type IRelaySubmitParams = any[]
export type IInputTxParams = {
  tx: IBitcoinBlockTx;
  txMerkleProof: IBitcoinTxMerkleProof;
  block: IBitcoinBlockDetail;
  brand?: string;
  payer?: string;
  inputIndex?: number;
  pubkeyPos?: number;
};

export type IInputOutpointParams = {
  tx: IBitcoinBlockTx;
  inputIdx?: number;
  pkhPos?: number;
  dxHash?: string;
};

export type IInputBountyParams = {
  tx: IBitcoinBlockTx;
  txMerkleProof: IBitcoinTxMerkleProof;

  block: IBitcoinBlockDetail
};
