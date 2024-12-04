import { IBitcoinBlockDetail, IBitcoinBlockDetails, IBitcoinBlockTxs, IWeb3Account, IWeb3AccountUTXO } from "@/type";
import { axiosErrorEncode, encodeBitcoinBlockKeys, weibtc } from "@/utils/utils";
import axios from "axios";
import { networks, payments, Psbt } from "bitcoinjs-lib";
import { useState } from "react";

export const useBitcoinNetwork = ({ web3Account }: { web3Account?: IWeb3Account }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchUTXO = async (addressOverride?: string) => {
    const address = addressOverride ?? web3Account?.btcAddress;
    try {
      setLoading(true);
      setError("");
      const utxoRes = await axios.get(`https://mempool.space/api/address/${address}/utxo`);
      const utxo: IWeb3AccountUTXO[] = utxoRes?.data;

      if (!Array.isArray(utxo)) {
        throw new Error("Invalid UTXO response");
      }

      const balance = utxo.reduce((sum, item) => sum + (item?.value || 0), 0);
      return {
        balance,
        displayBalance: weibtc(balance),
        utxo,
      };
    } catch (err) {
      console.error(err);
      setError(axiosErrorEncode(err));
      return {
        balance: 0,
        utxo: [],
      };
    } finally {
      setLoading(false);
    }
  };

  const searchForBountyInput = async (utxos: IWeb3AccountUTXO[]) => {
    const now = Math.floor(Date.now() / 1000);
    const maxBounty = 10; // Max recipients

    for (const utxo of utxos) {
      utxo.recipients = [];
      // for (let i = 0; i < 10; ++i) {
        const blockHeight = await axios
          .get(`https://mempool.space/api/blocks/tip/height`)
          .then((res) => res.data)
          .catch((err) => {
            console.error("Failed to fetch block height:", err);
            return null;
          });
        const blocks: IBitcoinBlockDetail[] = (await axios.get(`https://mempool.space/api/blocks/${blockHeight}`))?.data;
        const blocksData: IBitcoinBlockDetails = {}
        await Promise.all(blocks.map(async block => {
          const txs: IBitcoinBlockTxs = (await axios.get(`https://mempool.space/api/block/${block.id}/txs`))?.data
          blocksData[encodeBitcoinBlockKeys(block.height, block.id)] = {
            ...block,
            txs,
          }
        }))
        console.log('#blocksData', blocksData)

        for(let i = 0; i < 10; i++) {
          const block = blocks[i]
           try {
            console.log('#block', block)
            if (!block || block.bits === 0x1d00ffff) {
              continue; // Skip testnet blocks or invalid blocks
            }
            if (now - block.timestamp >= 60 * 60) {
              break; // Bounty: block too old
            }
          // for (const tx of block.tx) {
          //   if (!isHit(utxo.txid, tx.txid)) {
          //     continue;
          //   }
          //   try {
          //     // Check for OP_RETURN in recipient tx
          //     const hasOpRet = tx.vout.some((o:any) => o.scriptPubKey.asm.startsWith("OP_RETURN"));
          //     if (hasOpRet) {
          //       continue;
          //     }
          //     const recipient = tx.vout[tx.vout.length - 1]?.scriptPubKey?.address;
          //     if (
          //       utxo.recipients.some(
          //         (t:any) => recipient === t.outputs[t.outputs.length - 1]?.address
          //       )
          //     ) {
          //       continue; // Duplicate recipient
          //     }
          //     utxo.recipients.push(tx);
          //     if (utxo.recipients.length >= maxBounty) {
          //       console.log(`Found the first UTXO with enough ${maxBounty} bounty outputs`);
          //       return utxo;
          //     }
          //   } catch (err) {
          //     console.error(err);
          //   }
          // }
        } catch (err) {
          console.error(err);
        }
        }
        // const blockNumber = blockHeight - i;
        // console.log('#blockNumber | height', blockNumber, blockHeight)
       
      // }
    }

    // const utxoWithMostRecipient = utxos.reduce(
    //   (prev:any, current) =>
    //     (prev.recipients || []).length > (current.recipients || []).length ? prev : current,
    //   {}
    // );
    // console.log("Using the best UTXO found", utxoWithMostRecipient);
    return 0;
  };

  const broadcastTransaction = async (rawTxHex: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(`https://mempool.space/api/tx`, rawTxHex, {
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response?.data;
    } catch (err) {
      setError(axiosErrorEncode(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const mineTransaction = async () => {
    const network = networks.bitcoin;
    const psbt = new Psbt({ network });
    let memo = "endur.io";
    const dataScript = payments.embed({ data: [Buffer.from(memo, "utf8")] });
    if (!dataScript?.output) return;
    psbt.addOutput({
      script: dataScript.output,
      value: BigInt(0), // OP_RETURN outputs must have a value of 0
    });
    await searchForBountyInput(web3Account?.btcUTXOs ?? [])
    console.log("#dataScript", dataScript);
  };

  return {
    fetchUTXO,
    searchForBountyInput,
    broadcastTransaction,
    mineTransaction,
    loading,
    error,
  };
};

// Helper function to check transaction hash
const isHit = (utxoHash: string, txHash: string) => {
  return utxoHash === txHash; // Customize this logic as needed
};
