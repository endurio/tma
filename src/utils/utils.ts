import _secp256k1 from '@bitcoinerlab/secp256k1';
import {initEccLib,payments} from 'bitcoinjs-lib';
import buffer from "buffer"; // Import Buffer polyfill
import {ECPairFactory,ECPairInterface} from 'ecpair';
import {ethers} from "ethers";
window.Buffer = buffer.Buffer
export const generateBitcoinWalletFromEVMPrivateKey = (
  privateKeyHex: string,
  compressed: boolean = true
): { btcPublicKey: string; btcAddress: string, btcKeyPair: ECPairInterface } => {
  initEccLib(_secp256k1);
  const ECPair = ECPairFactory(_secp256k1);
  const cleanPrivateKeyHex = privateKeyHex.startsWith("0x")
  ? privateKeyHex.slice(2)
  : privateKeyHex;
  const privateKeyBuffer = buffer.Buffer.from(cleanPrivateKeyHex, 'hex');
  const keyPair = ECPair.fromPrivateKey(privateKeyBuffer, { compressed });
  const btcPublicKey = Array.from(keyPair.publicKey)
  .map((byte) => byte.toString(16).padStart(2, '0'))
  .join('');
  const { address } = payments.p2pkh({ pubkey: keyPair.publicKey });

  return {
    btcPublicKey,
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