import porAbi from "@/abi/endurio/PoR.sol/PoR.json";
import {PoR} from "@/app/contracts";
import {useWeb3Account} from "@/components/AccountManagement/hook/useWeb3Account";
import {JSONProvider} from "@/config";
import {IRelaySubmitParams} from "@/type";
import {prepareSubmit} from "@/utils/endurio";
import {Contract,Wallet} from "ethers";
import {useState} from "react";
import {useConfigs} from "./useConfigs";
import {axiosErrorEncode} from "@/utils/utils";
export const useEndurioContract = () => {
  const [relay, setRelay] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const {account} = useWeb3Account()
  const {configs} = useConfigs()
  const performRelay = async () => {
    if(!account?.evmSigner) return;
    setLoading(true)
    setError('')
    console.log('#relay', configs.PoR)
    try {
      const signer = new Wallet(account.evmPrivateKey, JSONProvider);
      const relayContract = new Contract(configs.PoR, porAbi.abi, signer) as PoR
      const IRelaySubmitParams: IRelaySubmitParams | [] = []
      const txHash = Object.keys(account.mineTxs)[Object.keys(account.mineTxs).length - 1] // lastetst mine tx in storage
      console.log(txHash)
      const {params, outpoint, bounty} = await prepareSubmit(txHash, account.evmAddress, account.mineTxs[txHash])
      if(!params) throw 'Submit params invalid';
      const BOUNTY_TIME = await relayContract.BOUNTY_RATE()
      console.log('#relay', relayContract)
      console.log('#relay bounty', BOUNTY_TIME)
      console.log('#relay-params-output-bounty', JSON.stringify({params, outpoint, bounty}))
      const res = await relayContract.callStatic.endurioRelay(params, outpoint, bounty )
      console.log('#relay', res)
      setLoading(false)
      setError('')
    } catch (error) {
      setError(axiosErrorEncode(error))
      setLoading(false)
      console.log('#relay-error', error)
    }
  }
  const performClaim = async () => {

  }
  return {
    endurioLoading: loading,
    endurioError: error,
    performRelay,
    performClaim
  };
};
