import {useAppContext} from "@/pages/IndexPage/IndexPage";
import {IWeb3Account} from "@/type";
import {WHITELIST_TOKEN_LIST} from "@/utils/constant";
import {loadWeb3AccountData} from "@/utils/tools";
import {decodeAccountKeys,encodeAccountKeys,generateBitcoinWalletFromEVMPrivateKey,generateEVMWallet,generateEVMWalletFromPrivateKey,isBtcAddress,isEvmAddress} from "@/utils/utils";
import {getCloudStorageItem,getCloudStorageKeys,setCloudStorageItem} from '@telegram-apps/sdk-react';
import {useEffect} from "react";

export const useWeb3Account = () => {
  const {web3Account, setWeb3Account, isFetchingWeb3Account, setIsFetchingWeb3Account} = useAppContext()
  const generateWeb3Account = (): IWeb3Account => {
    const evmWallet = generateEVMWallet()
    const btcWallet = generateBitcoinWalletFromEVMPrivateKey(evmWallet.privateKey)
    return {
      evmAddress: evmWallet.address,
      evmPrivateKey: evmWallet.privateKey,
      btcAddress: btcWallet.btcAddress,
      btcPublicKey: btcWallet.btcPublicKey,
      evmSigner: evmWallet.wallet,
      btcSigner: btcWallet.btcKeyPair,
      balances: {},
      allowances: {},
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
      btcSigner: btcWallet.btcKeyPair,
      balances: {},
      allowances: {},
    }
  }
  const fetchWeb3AccountState = async (web3AccountOverride?: IWeb3Account) => {
    const evmAddress = web3AccountOverride?.evmAddress || web3Account?.evmAddress
    const _webAccount = web3AccountOverride || web3Account
    if(!_webAccount || !evmAddress || !setIsFetchingWeb3Account || !setWeb3Account) return;
    // client.getUnspents(web3Account?.btcPublicKey ?? '')
    // .catch(console.error)
    // .then((unspents) => {
    //   console.log('#unspent', unspents)
    // })
    setIsFetchingWeb3Account(true)
    const web3State = await loadWeb3AccountData([evmAddress], WHITELIST_TOKEN_LIST,[])
    _webAccount.balances = web3State[evmAddress].balances
    _webAccount.allowances = web3State[evmAddress].allowances
    console.log('#state', _webAccount)

    setWeb3Account(_webAccount)
    setIsFetchingWeb3Account(false)
    return _webAccount
  }
  return {
    account: web3Account,
    isFetchingWeb3Account,
    setIsFetchingWeb3Account,
    fetchWeb3AccountState,
    setWeb3Account,
    generateWeb3Account,
    getWeb3AccountFromPrivateKey
  }
};

// web3 account keys = evmAddress-evmBtc, value = evmPrivateKey
const CURRENT_ACCOUNT_INDEX = 0 // for multi account if needed
export const useInitWeb3Account = () => {
  const {generateWeb3Account, getWeb3AccountFromPrivateKey, fetchWeb3AccountState, setWeb3Account, setIsFetchingWeb3Account} = useWeb3Account()
  const initAccount = async () => {
    if(!setIsFetchingWeb3Account || !setWeb3Account) return;
    setIsFetchingWeb3Account(true)
    try {
      const keys = await getCloudStorageKeys()
      const accountKeys = keys.filter(key => isEvmAddress(decodeAccountKeys(key)?.evmAddress || '') && isBtcAddress(decodeAccountKeys(key)?.btcAddress || ''))
      const currentAccountKey = accountKeys[CURRENT_ACCOUNT_INDEX]
      if(!currentAccountKey) {
        const web3Account = generateWeb3Account()
        const accountStoreKey = encodeAccountKeys(web3Account.evmAddress, web3Account.btcAddress)
        setWeb3Account(web3Account)
        await setCloudStorageItem(accountStoreKey, web3Account.evmPrivateKey)
        setIsFetchingWeb3Account(false)
      } else {
        const currentAccountPrivateKey = await getCloudStorageItem([currentAccountKey])
        const web3Account = getWeb3AccountFromPrivateKey(currentAccountPrivateKey[currentAccountKey])
        await fetchWeb3AccountState(web3Account) 
      };
    } catch (error) {
      console.error(error)
      setIsFetchingWeb3Account(false)
    }
    
  }
  useEffect(() => {
    initAccount()
  },[])
}

