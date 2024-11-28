import {IWeb3Account} from "@/type";
import {decodeAccountKeys, encodeAccountKeys, generateBitcoinWalletFromEVMPrivateKey, generateEVMWallet, generateEVMWalletFromPrivateKey, isBtcAddress, isEvmAddress} from "@/utils/utils";
import {useContext, useEffect} from "react";
import {getCloudStorageItem, getCloudStorageKeys, setCloudStorageItem} from '@telegram-apps/sdk-react'
import {AppContext, useAppContext} from "@/pages/IndexPage/IndexPage";

export const useWeb3Account = () => {
  const {web3Account, setWeb3Account} = useAppContext()
  const generateWeb3Account = (): IWeb3Account => {
    const evmWallet = generateEVMWallet()
    const btcWallet = generateBitcoinWalletFromEVMPrivateKey(evmWallet.privateKey)
    return {
      evmAddress: evmWallet.address,
      evmPrivateKey: evmWallet.privateKey,
      btcAddress: btcWallet.btcAddress,
      btcPublicKey: btcWallet.btcPublicKey,
      evmSigner: evmWallet.wallet,
      btcSigner: btcWallet.btcKeyPair
    }
  }
  const getWeb3AccountFromPrivateKey = (privateKey: string): IWeb3Account => {
    const evmWallet = generateEVMWalletFromPrivateKey(privateKey)
    const btcWallet = generateBitcoinWalletFromEVMPrivateKey(privateKey)
    return {
      evmAddress: evmWallet.address,
      evmPrivateKey: evmWallet.privateKey,
      btcAddress: btcWallet.btcAddress,
      btcPublicKey: btcWallet.btcPublicKey,
      evmSigner: evmWallet.wallet,
      btcSigner: btcWallet.btcKeyPair
    }
  }
  return {
    account: web3Account,
    setWeb3Account,
    generateWeb3Account,
    getWeb3AccountFromPrivateKey}
};

// web3 account keys = evmAddress-evmBtc, value = evmPrivateKey
const CURRENT_ACCOUNT_INDEX = 0 // for multi account if needed
export const useInitWeb3Account = () => {
  const {generateWeb3Account, getWeb3AccountFromPrivateKey, setWeb3Account} = useWeb3Account()
  const initAccount = async () => {
    const keys = await getCloudStorageKeys()
    const accountKeys = keys.filter(key => isEvmAddress(decodeAccountKeys(key)?.evmAddress || '') && isBtcAddress(decodeAccountKeys(key)?.btcAddress || ''))
    const currentAccountKey = accountKeys[CURRENT_ACCOUNT_INDEX]
    if(!currentAccountKey) {
      const web3Account = generateWeb3Account()
      const accountStoreKey = encodeAccountKeys(web3Account.evmAddress, web3Account.btcAddress)
      if(setWeb3Account) setWeb3Account(web3Account)
      await setCloudStorageItem(accountStoreKey, web3Account.evmPrivateKey)
    } else {
      const currentAccountPrivateKey = await getCloudStorageItem([currentAccountKey])
      const web3Account = getWeb3AccountFromPrivateKey(currentAccountPrivateKey[currentAccountKey])
      if(setWeb3Account) setWeb3Account(web3Account)
    };
  }
  useEffect(() => {
    initAccount()
  },[])
}

