import {IWeb3AccountUTXO} from "@/type";
import {networks, payments, Psbt} from "bitcoinjs-lib";

// Binary Search Logic for Optimal Bounty Transaction
const BTC_FEE =  1306
export function searchForBountyTransaction(
    start: number,
    end: number,
    inputs: IWeb3AccountUTXO[],
    recipients: any[]
  ) {
    const txFee = BTC_FEE
    function isValidTransaction(tx: any): boolean {
      if (!tx) return false;
      const txSize = tx.buildIncomplete().toBuffer().length + 1 + 106; // Adding script overhead
      const inputSize = 32 + 4 + 1 + 108 + 4;
      for (let i = 1; i < tx.outs.length - 1; ++i) {
        const out = tx.outs[i];
        const outputSize = 8 + 1 + out.script.length;
        const minTxSize = 10 + inputSize + outputSize;
        if (txFee * minTxSize > out.value * txSize) {
          return false;
        }
      }
      return true;
    }
  
    function buildTransaction(
      bountyAmount: number,
      outValue: number = 0
    ): Psbt | null {
      const tb = new Psbt({ network: networks.bitcoin });
      let inValue = 0;
  
      // Add memo output
      let memo = "endur.io";
      const dataScript = payments.embed({ data: [Buffer.from(memo, "utf8")] });
      if (!dataScript?.output) return null;
      tb.addOutput({
        script: dataScript.output,
        value: BigInt(0),
      });
  
      inputs.forEach((input, index) => {
        tb.addInput({
          hash: input.txid,
          index: input.vout,
        });
        inValue += input.value;
      });
  
      let outAmount = 0;
      for (const rec of recipients) {
        const amount = bountyAmount;
        if (outAmount + amount > inValue) break; // Not enough input value
        outAmount += amount;
        tb.addOutput({
          address: rec.scriptpubkey_address,
          value: BigInt(amount),
        });
      }
  
      // Calculate change
      const changeValue = inValue - outValue - txFee;
      if (changeValue <= 0) {
        console.warn("Insufficient funds.");
        return null;
      }
      tb.addOutput({
        address: web3Account?.btcAddress!,
        value: changeValue,
      });
  
      return tb;
    }
  
    return search(start, end, null);
  
    function search(start: number, end: number, last: Psbt | null): Psbt | null {
      if (start > end) return last || buildTransaction(end);
      const mid = Math.floor((start + end) / 2);
      const tx = buildTransaction(mid);
      if (tx && isValidTransaction(tx)) {
        return search(start, mid - 1, tx);
      } else {
        return search(mid + 1, end, last);
      }
    }
  }