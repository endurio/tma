import {useEffect, useState} from "react";
import {useConfigs} from "./useConfigs";
import {Contract} from "ethers";
import porAbi from "@/abi/endurio/PoR.sol/PoR.json"
import {useWeb3Account} from "@/components/AccountManagement/hook/useWeb3Account";
import {IRelaySubmitParams} from "@/type";
import {prepareSubmit} from "@/utils/endurio";
export const useEndurioContract = () => {
  const [relay, setRelay] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const {account} = useWeb3Account()
  const {configs} = useConfigs()
  const performRelay = async () => {
    const relayContract = new Contract(configs.PoR, porAbi.abi, account?.evmSigner)
    const IRelaySubmitParams: IRelaySubmitParams | [] = []
    await prepareSubmit('c6d5a4879077bccc8d8f14ae7d0c683a0818f554f6bb764a50522150b7c8fa96')
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
