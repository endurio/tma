import porAbi from "@/abi/endurio/PoR.sol/PoR.json";
import { PoR } from "@/app/contracts";
import { useWeb3Account } from "@/components/AccountManagement/hook/useWeb3Account";
import { JSONProvider } from "@/config";
import { prepareSubmit } from "@/utils/endurio";
import testSubmit from "@/utils/submit.test.json";
import { axiosErrorEncode } from "@/utils/utils";
import { BigNumber, Contract, Wallet } from "ethers";
import { useState } from "react";
import { useConfigs } from "./useConfigs";
import { setCloudStorageItem } from "@telegram-apps/sdk";

export const useEndurioContract = () => {
  const [state, setState] = useState<{ [txHash: string]: { relayTx?:string, loading: boolean; error: string } }>({});

  const { account } = useWeb3Account();
  const { configs } = useConfigs();

  const updateState = (txHash: string, updates: Partial<{ relayTx?:string, loading: boolean; error: string }>) => {
    setState((prev) => ({
      ...prev,
      [txHash]: { ...prev[txHash], ...updates }, // Update state for specific txHash
    }));
  };

  const performRelay = async ({ txHash, callStatic }: { txHash: string; callStatic: boolean }) => {
    if (!account?.evmSigner) return;

    updateState(txHash, { loading: true, error: "" });

    try {
      const signer = new Wallet(account.evmPrivateKey, JSONProvider);
      const relayContract = new Contract(configs.ProxyPoR, porAbi.abi, signer) as PoR;

      const { params, outpoint, bounty } = await prepareSubmit(txHash, account.evmAddress, account.mineTxs[txHash]);
      if (!params) throw new Error("Submit params invalid");

      console.log("#relay-params-output-bounty", { params, outpoint, bounty }, outpoint[0].vout);
      console.log("#relay-test", testSubmit, testSubmit.outpoint[0].vout);

      if (callStatic) {
        const res = await relayContract.callStatic.endurioRelay(params, outpoint, bounty);
        console.log("#relay", res);
        updateState(txHash, { loading: false });
        return res;
      }

      const res = await relayContract.endurioRelay(params, outpoint, bounty);
      const txHashReq = await res.wait();

      account.mineTxs[txHash].isRelayed = true;
      await setCloudStorageItem(`minetx-${txHash}`, JSON.stringify(account.mineTxs[txHash]));

      updateState(txHash, { relayTx: txHashReq.transactionHash, loading: false });
    } catch (error) {
      const encodedError = axiosErrorEncode(error);
      updateState(txHash, { error: encodedError, loading: false });
      console.error("#relay-error", error);
    }
  };

  const performMultiRelay = async (transactions: { txHash: string; callStatic: boolean }[]) => {
    if (!Array.isArray(transactions)) {
      throw new Error("Invalid input: transactions must be an array.");
    }

    let results = [];

    for (const tx of transactions) {
      const { txHash, callStatic } = tx;
      try {
        const result = await performRelay({ txHash, callStatic: callStatic });
        results.push({ txHash, status: "success", result });
      } catch (error) {
        console.error(`Error relaying tx ${txHash}:`, error);
        results.push({ txHash, status: "error", error });
      }
    }

    return results;
  };

  const performClaim = async () => {
    // Placeholder for claim logic
  };

  return {
    relayState: state,
    performMultiRelay,
    performRelay,
    performClaim,
  };
};
