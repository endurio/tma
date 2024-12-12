import porAbi from "@/abi/endurio/PoR.sol/PoR.json";
import {PoR} from "@/app/contracts";
import {useWeb3Account} from "@/components/AccountManagement/hook/useWeb3Account";
import {JSONProvider} from "@/config";
import {IRelaySubmitParams} from "@/type";
import {prepareSubmit} from "@/utils/endurio";
import {Contract,Wallet} from "ethers";
import {useState} from "react";
import {useConfigs} from "./useConfigs";
export const useEndurioContract = () => {
  const [relay, setRelay] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const {account} = useWeb3Account()
  const {configs} = useConfigs()
  const performRelay = async () => {
    if(!account?.evmSigner) return;
    console.log('#relay', configs.PoR)
    try {
      const signer = new Wallet(account.evmPrivateKey, JSONProvider);
      const relayContract = new Contract(configs.PoR, porAbi.abi, signer) as PoR
      const IRelaySubmitParams: IRelaySubmitParams | [] = []
      // https://mempool.space/testnet4/tx/64abdcbb7cd7cc2bf14d3540a5c896c5ed06ff6b205d4b1b2cf596815d22c3cf
      const {params, outpoint, bounty} = await prepareSubmit('64abdcbb7cd7cc2bf14d3540a5c896c5ed06ff6b205d4b1b2cf596815d22c3cf', account.evmAddress)
      const BOUNTY_TIME = await relayContract.BOUNTY_RATE()
      console.log('#relay', relayContract)
      console.log('#relay bounty', BOUNTY_TIME)
      console.log('#relay-params-output-bounty', params, outpoint, bounty)
      const res = await relayContract.callStatic.endurioRelay(params, outpoint, bounty )
      console.log('#relay', res)
    } catch (error) {
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
