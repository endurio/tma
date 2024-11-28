import {IWeb3Account} from "@/type";
import {generateBitcoinAddressFromEVMPrivateKey, generateEVMWallet} from "@/utils/utils";

export const useWeb3Account = () => {
  const generateWeb3Account = (): IWeb3Account => {
    const evmWallet = generateEVMWallet()
    const btcWallet = generateBitcoinAddressFromEVMPrivateKey(evmWallet.privateKey)
    return {
      evmAddress: evmWallet.address,
      evmPrivateKey: evmWallet.privateKey,
      btcAddress: btcWallet.btcAddress,
      btcPublicKey: btcWallet.btcPublicKey,
      evmSigner: evmWallet.wallet,
      btcSigner: btcWallet.btcKeyPair
    }
  }
  return {generateWeb3Account}
};


