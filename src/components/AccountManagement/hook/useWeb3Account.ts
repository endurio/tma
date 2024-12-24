import {useBitcoinNetwork} from "@/hook/useBitcoinNetwork";
import {useAppContext} from "@/pages/IndexPage/IndexPage";
import {IWeb3Account, IWeb3AccountUTXO} from "@/type";
import {WHITELIST_TOKEN_LIST} from "@/utils/constant";
import {loadWeb3AccountData} from "@/utils/tools";
import {decodeAccountKeys,encodeAccountKeys,generateBitcoinWalletFromEVMPrivateKey,generateEVMWallet,generateEVMWalletFromPrivateKey,isBtcAddress,isEvmAddress} from "@/utils/utils";
import {getCloudStorageItem,getCloudStorageKeys,setCloudStorageItem} from '@telegram-apps/sdk-react';
import {useEffect} from "react";

export const useWeb3Account = () => {
  const {web3Account, setWeb3Account, isFetchingWeb3Account, setIsFetchingWeb3Account} = useAppContext()
  const {fetchUTXO} = useBitcoinNetwork({web3Account})
  const generateWeb3Account = (): IWeb3Account => {
    const evmWallet = generateEVMWallet()
    const btcWallet = generateBitcoinWalletFromEVMPrivateKey(evmWallet.privateKey)
    return {
      evmAddress: evmWallet.address,
      evmPrivateKey: evmWallet.privateKey,
      btcAddress: btcWallet.btcAddress,
      btcNonSegwitAddress: btcWallet.btcNonSegwitAddress,
      evmSigner: evmWallet.wallet,
      btcSigner: btcWallet.btcKeyPair,
      mineTxs: {},
      balances: {},
      allowances: {},
      btcUTXOs: []
    }
  }
  const getWeb3AccountFromPrivateKey = (privateKey: string): IWeb3Account => {
    const evmWallet = generateEVMWalletFromPrivateKey(privateKey)
    const btcWallet = generateBitcoinWalletFromEVMPrivateKey(privateKey)
    
    return {
      evmAddress: evmWallet.address,
      evmPrivateKey: evmWallet.privateKey,
      btcAddress: btcWallet.btcAddress,
      btcNonSegwitAddress: btcWallet.btcNonSegwitAddress,
      evmSigner: evmWallet.wallet,
      btcSigner: btcWallet.btcKeyPair,
      mineTxs: {},
      balances: {},
      allowances: {},
      btcUTXOs: []
    }
  }
  const fetchWeb3AccountState = async (web3AccountOverride?: IWeb3Account) => {
    const evmAddress = web3AccountOverride?.evmAddress || web3Account?.evmAddress
    const btcAddress = web3AccountOverride?.btcAddress || web3Account?.btcAddress
    const _webAccount = web3AccountOverride || web3Account
    if(!_webAccount || !btcAddress || !evmAddress || !setIsFetchingWeb3Account || !setWeb3Account) return;
    setIsFetchingWeb3Account(true)
    const web3State = await loadWeb3AccountData([evmAddress], WHITELIST_TOKEN_LIST,[])
    const mineTxKeys = (await getCloudStorageKeys()).filter(mineTxKey => mineTxKey?.split('-')[0] === 'minetx')
    const mineTxInputsData = await getCloudStorageItem(mineTxKeys)
    const balance = await fetchUTXO(btcAddress)
    const mineTxInputs: {[key:string]: IWeb3AccountUTXO} = {}
    Object.keys(mineTxInputsData).map(mineTxKey => {
      mineTxInputs[mineTxKey.split('-')[1]] = JSON.parse(mineTxInputsData[mineTxKey])
    })
    _webAccount.mineTxs = mineTxInputs
    _webAccount.balances = web3State[evmAddress].balances
    _webAccount.allowances = web3State[evmAddress].allowances
    _webAccount.btcDisplayBalance = Number(balance.displayBalance)
    _webAccount.btcBalance = Number(balance.balance)
    _webAccount.btcUTXOs = balance.utxo
    console.log('#_webAccount', _webAccount)
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

