import _secp256k1 from '@bitcoinerlab/secp256k1';
import {initEccLib,payments, networks} from 'bitcoinjs-lib';
import buffer from "buffer"; // Import Buffer polyfill
import {ECPairFactory,ECPairInterface} from 'ecpair';
import {BigNumber,ethers} from "ethers";
import {keccak256} from 'ethers/lib/utils';
import {BITCOIN_NETWORK} from './constant';
window.Buffer = buffer.Buffer
initEccLib(_secp256k1);
export const ECPair = ECPairFactory(_secp256k1);
export const generateBitcoinWalletFromEVMPrivateKey = (
  privateKeyHex: string,
  compressed: boolean = true
): { btcNonSegwitAddress: string; btcAddress: string, btcKeyPair: ECPairInterface } => {

  const cleanPrivateKeyHex = privateKeyHex.startsWith("0x")
  ? privateKeyHex.slice(2)
  : privateKeyHex;
  const privateKeyBuffer = buffer.Buffer.from(cleanPrivateKeyHex, 'hex');
  const keyPair = ECPair.fromPrivateKey(privateKeyBuffer, { compressed });
  const btcPublicKey = Array.from(keyPair.publicKey)
  .map((byte) => byte.toString(16).padStart(2, '0'))
  .join('');
  const { address } = payments.p2wpkh({ pubkey: keyPair.publicKey, network: BITCOIN_NETWORK});
  const { address: addressNonSegWith } = payments.p2pkh({ pubkey: keyPair.publicKey, network: BITCOIN_NETWORK});

  return {
    btcNonSegwitAddress: addressNonSegWith ?? btcPublicKey,
    btcAddress: address || '',
    btcKeyPair: keyPair,
  };
};

export const generateEVMWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  const privateKey = wallet.privateKey
  const cleanPrivateKey = privateKey.startsWith("0x")
  ? privateKey
  : `0x${privateKey}`;
  const walletEthers = new ethers.Wallet(cleanPrivateKey);

  return {
    wallet: walletEthers,
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

export const generateEVMWalletFromPrivateKey = (
  privateKey: string
)=> {
  const cleanPrivateKey = privateKey.startsWith("0x")
    ? privateKey
    : `0x${privateKey}`;
  const wallet = new ethers.Wallet(cleanPrivateKey);

  return {
    wallet: wallet,
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

export const isEvmAddress = (address: string): boolean => {
  const evmAddressPattern = /^0x[a-fA-F0-9]{40}$/;
  return evmAddressPattern.test(address);
};

export const isBtcAddress = (address: string): boolean => {
  const btcAddressPattern1 = /^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$/;
  const btcAddressPattern2 = /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/;
  return btcAddressPattern1.test(address) || btcAddressPattern2.test(address);
};

export const encodeAccountKeys = (evmAddress: string, btcAddress: string): string => {
  return `${evmAddress}-${btcAddress}`;
};

export const decodeAccountKeys = (encodedKeys: string): { evmAddress: string, btcAddress: string }=> {
  const keys = encodedKeys.split('-');
  if (keys.length === 2) {
    const [evmAddress, btcAddress] = keys;
    return { evmAddress, btcAddress };
  } else {
    return { evmAddress: '', btcAddress: '' };

  }
};


export const encodeBitcoinBlockKeys = (blockNumber: Number, blockHash: string): string => {
  return `${blockNumber}-${blockHash}`;
};

export const decodeBitcoinBlockKeys = (encodedBitcoinKeys: string): { blockNumber: Number, blockHash: string }=> {
  const keys = encodedBitcoinKeys.split('-');
  if (keys.length === 2) {
    const [blockNumber, blockHash] = keys;
    return { blockNumber: Number(blockNumber), blockHash };
  } else {
    return { blockNumber: 0, blockHash: '' };

  }
};

export function shortenAddress(address?:string, startLen = 4, endLen = 4): string {
  if(!address) return '';
  const start = address.slice(0, 2+startLen);
  const end = address.slice(-endLen);
  return `${start}...${end}`;
}


export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    console.log("Copied to clipboard:", text);
  }).catch(err => {
    console.error("Failed to copy to clipboard:", err);
  });
};

export const axiosErrorEncode = (err: any):any => {
  return err?.response?.data || `${err?.code}: ${err?.reason || err?.msg || err?.message}`
}
export const iewbtc = (a: number | string | BigInt | BigNumber): string => {
  return String(Number(a ?? 0) * 1e8)
}
export const weibtc = (a: number | string | BigInt | BigNumber): string => {
  return String(Number(a ?? 0) / 1e8)
}
export const wei = (a: number | string | BigInt | BigNumber): string => {
  return String(Number(a ?? 0) / 1e18)
}

export const iew = (a: number | string | BigInt | BigNumber): string => {
  return String(Number(a ?? 0) / 1e18)
}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function toFixed(x: any): string {
    if (Math.abs(x) < 1.0) {
      // eslint-disable-next-line no-var
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = String('0.' + (new Array(e)).join('0') + x.toString().substring(2));
      }
    } else {
      // eslint-disable-next-line no-var
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x = String(x + (new Array(e + 1)).join('0'));
      }
    }
    return x;
  }
  export const zerofy = (value: number, minZeroDecimal: number = 4): string => {
    const x = value
    const countZeroAfterDot = -Math.floor(Math.log10(x) + 1)
    if (
      Number.isFinite(countZeroAfterDot) &&
      countZeroAfterDot >= minZeroDecimal
    ) {
      const ucZeros = String.fromCharCode(
        parseInt(`+208${countZeroAfterDot}`, 16)
      )
      return x
        .toLocaleString('fullwide', {
          maximumSignificantDigits: 4,
          maximumFractionDigits: 18
        })
        .replace(/[.,]{1}0+/, `.0${ucZeros}`)
    }
    return value.toLocaleString('fullwide', {
      maximumSignificantDigits: 4,
      maximumFractionDigits: 18
    })
  }

  export const openBitcoinExplorer = ({address, tx}:{address?: string, tx?: string}) => {
    if(address)
      window.open(`https://mempool.space/address/${address}`, '_blank')
    else if(tx) window.open(`https://mempool.space/tx/${tx}`, '_blank')
  }

  export const openEVVMExplorer = ({address, tx}:{address?: string, tx?: string}) => {
    if(address)
      window.open(`https://https://arbiscan.io/address/${address}`, '_blank')
    else if(tx) window.open(`https://https://arbiscan.io/tx/${tx}`, '_blank')
  }
  export function isHit(txid:string, recipient: string) {
    const hash = keccak256(Buffer.from(recipient+txid, 'hex').reverse())
    return BigInt(hash) % 32n === 0n
  }

