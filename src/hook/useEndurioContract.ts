import {useEffect, useState} from "react";
import {useConfigs} from "./useConfigs";
import {Contract, Signer, Wallet} from "ethers";
import porAbi from "@/abi/endurio/PoR.sol/PoR.json"
import {useWeb3Account} from "@/components/AccountManagement/hook/useWeb3Account";
import {IRelaySubmitParams} from "@/type";
import {prepareSubmit} from "@/utils/endurio";
import {JSONProvider} from "@/config";
import {PoR__factory} from "@/app/contracts/factories/index"
import {PoR} from "@/app/contracts";
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
      const {params, outpoint, bounty} = await prepareSubmit('c6d5a4879077bccc8d8f14ae7d0c683a0818f554f6bb764a50522150b7c8fa96', account.evmAddress)
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
