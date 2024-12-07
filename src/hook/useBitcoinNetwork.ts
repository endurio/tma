import {
  IBitcoinBlockDetail,
  IBitcoinBlockDetails,
  IWeb3Account,
  IWeb3AccountUTXO
} from "@/type";
import {
  axiosErrorEncode,
  ECPair,
  encodeBitcoinBlockKeys,
  isHit,
  weibtc
} from "@/utils/utils";
import axios from "axios";
import {networks,payments,Psbt} from "bitcoinjs-lib";
import {bitcoin} from "bitcoinjs-lib/src/networks";
import {TransactionInput} from "bitcoinjs-lib/src/psbt";
import {useEffect, useState} from "react";
const BTC_FEE = 1306;
export const useBitcoinNetwork = ({
  web3Account,
}: {
  web3Account?: IWeb3Account;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [btcInput, setBtcInput] = useState<IWeb3AccountUTXO>();
  const fetchUTXO = async (addressOverride?: string) => {
    const address = addressOverride ?? web3Account?.btcAddress;
    try {
      setLoading(true);
      setError("");
      const utxoRes = await axios.get(
        `https://mempool.space/api/address/${address}/utxo`
      );
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

  const searchForBountyInput = async ({utxos, maxBountyOverride}:{utxos: IWeb3AccountUTXO[], maxBountyOverride: number}) => {
    const now = Math.floor(Date.now() / 1000);
    const maxBounty = maxBountyOverride || 8; // Max recipients

    for (const utxo of utxos) {
      utxo.recipients = [];
      const blockHeight = await axios
        .get(`https://mempool.space/api/blocks/tip/height`)
        .then((res) => res.data)
        .catch((err) => {
          console.error("Failed to fetch block height:", err);
          return null;
        });
      const blocks: IBitcoinBlockDetail[] = (
        await axios.get(`https://mempool.space/api/blocks/${blockHeight}`)
      )?.data;
      const blocksData: IBitcoinBlockDetails = {};
      await Promise.all(
        blocks.map(async (block) => {
          const txs: string[] = (
            await axios.get(`https://mempool.space/api/block/${block.id}/txids`)
          )?.data;
          if (!block || block.bits === 0x1d00ffff) {
            return; // Skip testnet blocks or invalid blocks
          }
          if (now - block.timestamp >= 60 * 60) {
            return; // Bounty: block too old
          }
          const txsHit = txs.filter((txid) => isHit(utxo.txid, txid));
          // console.log("txs", txs.length);
          blocksData[encodeBitcoinBlockKeys(block.height, block.id)] = {
            ...block,
            txs: txsHit,
          };
        })
      );
      // console.log(blocksData);
      // console.log("#blocksData", blocksData);
      for (let i = 0; i < 10; i++) {
        const blockKey = Object.keys(blocksData)[i];
        const block = blocksData[blockKey];
        try {
          // console.log("#block", block);
          if (!block || block.bits === 0x1d00ffff) {
            continue; // Skip testnet blocks or invalid blocks
          }
          if (now - block.timestamp >= 60 * 60) {
            break; // Bounty: block too old
          }
          for (const tx of block.txs) {
            const txDetail = (await axios.get(`https://mempool.space/api/tx/${tx}`)).data
            if (!isHit(utxo.txid, tx)) {
              continue;
            }
            try {
              // Check for OP_RETURN in recipient tx
              const hasOpRet = txDetail.vout.some((o:any) =>
                o.scriptpubkey_asm.startsWith("OP_RETURN")
              );
              if (hasOpRet) {
                continue;
              }
              const recipient =
                txDetail.vout[txDetail.vout.length - 1]?.scriptpubkey_address;
              if (
                utxo.recipients.some(
                  (t) =>
                    recipient ===
                    t.vout[t.vout.length - 1]?.scriptpubkey_address
                )
              ) {
                continue; // Duplicate recipient
              }
              if((maxBounty as Number) === 0) return utxo;
              utxo.recipients.push(txDetail);
              if (utxo.recipients.length >= maxBounty) {
                console.log(
                  `Found the first UTXO with enough ${maxBounty} bounty outputs`,utxo
                );
                const rawHex = (await axios.get(`https://mempool.space/api/tx/${utxo.txid}/hex`)).data
                const _utxo: IWeb3AccountUTXO = utxo
                _utxo.rawTxHex = rawHex
                for(let i = 0; i < (_utxo?.recipients?.length || 0) ; i++) {
                  const _rawHex = (await axios.get(`https://mempool.space/api/tx/${utxo.txid}/hex`)).data
                  if( _utxo.recipients) _utxo.recipients[i].rawTxHex = _rawHex
                }
                // console.log('#utxo', _utxo)
                // _utxo.recipients?.map(async (rec) => {
                //   const _rawHex = (await axios.get(`https://mempool.space/api/tx/${utxo.txid}/hex`)).data
                //   rec.hex = _rawHex
                // })
                return _utxo;
              }
            } catch (err) {
              console.error(err);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    const utxoWithMostRecipient = utxos.reduce(
      (prev: IWeb3AccountUTXO, current) =>
        (prev.recipients || []).length > (current.recipients || []).length
          ? prev
          : current,
      {} as any
    );
    // console.log("Using the best UTXO found", utxoWithMostRecipient);

    return utxoWithMostRecipient;
  };

  const broadcastTransaction = async (rawTxHex: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(
        `https://mempool.space/api/tx`,
        rawTxHex,
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
      // console.log(response.data)
      return response?.data;
    } catch (err) {
      setError(axiosErrorEncode(err));
      return null;
    } finally {
      setLoading(false);
    }
  };
  const mineTransaction = async ({maxBounty, opReturn, isEstimateOnly = true}:{maxBounty: number, opReturn: string, isEstimateOnly?: boolean}) => {
    if (isNaN(BTC_FEE) || !web3Account?.btcUTXOs) {
      return;
    }
    const input = await searchForBountyInput({utxos: web3Account?.btcUTXOs ?? [], maxBountyOverride: maxBounty});
    setBtcInput(input)

    const psbt: Psbt = await _searchMineTransaction({start: 1, end: BTC_FEE, last: undefined, input, maxBounty, opReturn});
    if(!psbt?.data) {
      return;
    }

    console.log('#psbt-input', psbt.txInputs)
    console.log('#psbt-output', psbt.txOutputs)

    const signer = web3Account.btcSigner

    for (let i = 0; i < psbt.txInputs.length; ++i) {
      try {
        psbt.signInput(i, signer);
      } catch (err) {
        console.error("Error signing input", err);
      }
    }
    psbt.finalizeAllInputs();
    const signedTransaction = psbt.extractTransaction();
    const txHex = signedTransaction.toHex();
    if(isEstimateOnly) return {
      psbt,
      txHash: '',
      txHex: txHex
    }
    const txHash = await broadcastTransaction(txHex)
    return {
      psbt,
      txHash: txHash,
      txHex: txHex
    }
  };

  const _searchMineTransaction = ({start, end, last, input, maxBounty, opReturn}:{start:number, end: number, last?: any, input:IWeb3AccountUTXO, maxBounty: number, opReturn: string}) => {
    if (start > end) return last || _buildMineTransaction({bountyAmount: end, outValue: 0, btcInputOverride: input, opReturn, maxBounty});
    const mid = Math.floor((start + end) / 2);
    const tb = (_buildMineTransaction({bountyAmount: mid, outValue: 0, btcInputOverride: input, opReturn, maxBounty })) as Psbt;
    // tb.txOutputs.
    // that will give you a bitcoin.Transaction object, if you need the bitcoin.TransactionBuilder then you need to add the following line.
    if (isValid(tb)) {
      return _searchMineTransaction({start: start, end: mid - 1, last: tb, input, maxBounty, opReturn});
    } else {
      return _searchMineTransaction({start: mid + 1, end, last, input, maxBounty, opReturn});
    }

    function isValid(tb:any) {
      if (!tb) {
        return false;
      }
      if(!(tb as Psbt)?.data) return false;
      const txSize = tb.toBuffer().length + 1 + 106; // minimum 106 bytes redeem script
      const inputSize = 32 + 4 + 1 + 108 + 4; // give redeem script some extra bytes for tolerancy
      // assume that the first output is OP_RET and the last is the coin change
      for (let i = 1; i < tb.txOutputs.length - 1; ++i) {
        const out = tb.txOutputs[i];
        const outputSize = 8 + 1 + out.script.length;
        const minTxSize = 10 + inputSize + outputSize;
        if (BTC_FEE * minTxSize > Number(out.value) * txSize) {
          return false;
        }
      }
      return true;
    }
  }
  const _buildMineTransaction = ({bountyAmount, outValue = 0, btcInputOverride, maxBounty, opReturn}:{bountyAmount: number, outValue:number, btcInputOverride: IWeb3AccountUTXO, maxBounty: number, opReturn: string}) => {
    const network = networks.bitcoin;
    const psbt = new Psbt({ network });
    let memo = opReturn || "endur.io";
    const dataScript = payments.embed({ data: [Buffer.from(memo, "utf8")] });
    if (!dataScript?.output) return;
    psbt.addOutput({
      script: dataScript.output,
      value: BigInt(0), // OP_RETURN outputs must have a value of 0
    });
    let inValue = 0;
    const buildWithoutChange = () => {
      let recIdx = 0;
      const input = btcInputOverride || btcInput
      if(!btcInputOverride) return;
      // await searchForBountyInput(web3Account?.btcUTXOs ?? []);
      const recipients = input?.recipients ?? [];
      const inputs = input ? [input] : [];

      web3Account?.btcUTXOs.forEach((o) => {
        if (o.txid !== input?.txid || o.vout !== input.vout) {
          inputs.push(o);
        }
      });
      console.log('#inputs', inputs,recipients)

      for (let i = 0; i < inputs.length; i++) {
        const _input = inputs[i];
        // const index = (_input as any)?.["tx_output_n"]
        //   ? _input.tx_output_n
        //   : _input.index;
        psbt.addInput({
          hash: _input?.txid,
          index: _input?.vout,
          ...(input?.rawTxHex ? {nonWitnessUtxo: Buffer.from(input?.rawTxHex ?? '', 'hex')} : {}),
        });
        inValue += _input?.value || 0;
  
        while (recIdx < recipients.length) {
          // const rec = recipients[recIdx % (recipients.length>>1)]     // duplicate recipient
          const rec = recipients[recIdx];
          const output = rec.vout[rec.vout.length - 1];
          const amount = bountyAmount;
          if (outValue + amount > inValue) {
            break; // need more input
          }
          outValue += amount;
          // // console.log('#bountyAmount)
          psbt.addOutput({script: Buffer.from(output.scriptpubkey, "hex"), value: BigInt(bountyAmount)});
          if (++recIdx >= recipients.length) {
            return;
          }
        }
      }
    }
    buildWithoutChange()
    // console.log("#dataScript", inValue, outValue,  BTC_FEE);
    const changeValue = inValue - outValue - BTC_FEE;
    if (changeValue <= 0) {
      return "insufficient fund";
    }
    psbt.addOutput({address: web3Account?.btcAddress ?? '', value: BigInt(changeValue)});
    return psbt;
  };

  return {
    fetchUTXO,
    mineTransaction,
    loading,
    error,
  };
};

// function build(bountyAmount, outValue = 0) {
//   const tb = new TransactionBuilder(getNetwork(coinType));

//   // add the memo output
//   let memo = "endur.io";
//   if (xmine.get(coinType) > 1) {
//     memo += " x" + xmine.get(coinType);
//   }
//   const dataScript = payments.embed({ data: [Buffer.from(memo, "utf8")] });
//   tb.addOutput(dataScript.output, 0);

//   let inValue = 0;
//   // build the mining outputs and required inputs

//   buildWithoutChange();

//   const changeValue = inValue - outValue - BTC_FEE;
//   if (changeValue <= 0) {
//     return "insufficient fund";
//   }
//   tb.addOutput(sender.address, changeValue);

//   return tb;

//   function buildWithoutChange() {
//     let recIdx = 0;
//     for (const input of inputs) {
//       const index = input.hasOwnProperty("tx_output_n")
//         ? input.tx_output_n
//         : input.index;
//       tb.addInput(input.tx_hash, index);
//       inValue += parseInt(input.value);

//       while (recIdx < recipients.length) {
//         // const rec = recipients[recIdx % (recipients.length>>1)]     // duplicate recipient
//         const rec = recipients[recIdx];
//         const output = rec.outputs[rec.outputs.length - 1];
//         const amount = bountyAmount;
//         if (outValue + amount > inValue) {
//           break; // need more input
//         }
//         outValue += amount;
//         tb.addOutput(Buffer.from(output.script, "hex"), amount);
//         if (++recIdx >= recipients.length) {
//           // recipients list exhausted
//           return;
//         }
//       }
//     }
//     // utxo list exhausted
//   }

//   function getNetwork(coinType) {
//     const coinInfo = ci(coinType);
//     return {
//       messagePrefix: coinInfo.messagePrefix ? coinInfo.messagePrefix : "",
//       bech32: coinInfo.bech32,
//       bip32: coinInfo.versions.bip32,
//       pubKeyHash: coinInfo.versions.public,
//       scriptHash: coinInfo.versions.scripthash,
//       wif: coinInfo.versions.private,
//     };
//   }
// }
