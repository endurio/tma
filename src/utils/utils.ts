import { ethers } from "ethers";
import buffer from "buffer"; // Import Buffer polyfill
import {initEccLib, payments} from 'bitcoinjs-lib'
import _secp256k1 from '@bitcoinerlab/secp256k1';
import {ECPairFactory, ECPairAPI, TinySecp256k1Interface} from 'ecpair';
window.Buffer = buffer.Buffer
export const generateBitcoinAddressFromEVMPrivateKey = (
  privateKeyHex: string,
  compressed: boolean = true
): { btcPublicKey: string; btcAddress: string } => {
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
  };
};

export const generateEVMWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    mnemonic: wallet?.mnemonic?.phrase,
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};
