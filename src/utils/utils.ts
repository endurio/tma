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