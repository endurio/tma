import {IWeb3Account, IWeb3AccountUTXO} from "@/type";
import {axiosErrorEncode, weibtc} from "@/utils/utils";
import axios from "axios";
import {useState} from "react";

export const useBitcoinNetwork = ({web3Account}: {web3Account?: IWeb3Account}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchUTXO = async (addressOverride?: string) => {
    const address = addressOverride ?? web3Account?.btcPublicKey;
    try {
      setLoading(true);
      setError('');
      const utxoRes = await axios.get(`https://mempool.space/api/address/${address}/utxo`);
      const utxo: IWeb3AccountUTXO[] = utxoRes?.data;

      if (!Array.isArray(utxo)) {
        throw new Error("Invalid UTXO response");
      }

      const balance = (utxo.reduce((sum, item) => sum + (item?.value || 0), 0));
      return {
        balance,
        displayBalance: weibtc(balance),
        utxo,
      };
    } catch (err) {
      console.error(err)
      setError(axiosErrorEncode(err));
      return {
        balance: 0,
        utxo: [],
      };
    } finally {
      setLoading(false);
    }
  };
  const broadcastTransaction = async (rawTxHex: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(
        `https://mempool.space/api/tx`,
        rawTxHex,
        {
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
      return response?.data;
    } catch (err) {
      setError(axiosErrorEncode(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchUTXO,
    broadcastTransaction,
    loading,
    error,
  };
};
