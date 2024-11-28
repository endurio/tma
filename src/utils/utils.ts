import _secp256k1 from '@bitcoinerlab/secp256k1';
import {initEccLib,payments} from 'bitcoinjs-lib';
import buffer from "buffer"; // Import Buffer polyfill
import {ECPairFactory,ECPairInterface} from 'ecpair';
import {ethers} from "ethers";
window.Buffer = buffer.Buffer
export const generateBitcoinAddressFromEVMPrivateKey = (
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
  return {
    wallet,
    mnemonic: wallet?.mnemonic?.phrase,
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};
