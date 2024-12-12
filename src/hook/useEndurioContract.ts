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
    const params = await prepareSubmit('0d3097c0c60658aaa024b6d9e2b18a550af886b5ae7507e3e2ace8dd3dc175ad')
    // relayContract.callStatic.
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
