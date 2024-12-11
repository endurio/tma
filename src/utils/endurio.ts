import { BITCOIN_TESTNET_REQUEST } from "@/hook/useBitcoinNetwork";
import {
  IBitcoinBlockDetail,
  IBitcoinBlockDetails,
  IBitcoinBlockTx,
  IBitcoinTxMerkleProof,
  IInputBountyParams,
  IInputOutpointParams,
  IInputTxParams,
  IParamBounty,
  IParamOutpoint,
  IParamSubmit,
  IRelaySubmitParams,
} from "@/type";
import axios from "axios";
import { chown } from "fs";
import { Buffer } from "buffer";
import { hash256 } from "bitcoinjs-lib/src/crypto";
import { MerkleTree } from "merkletreejs";
import { SHA256 } from "crypto-js";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const prepareSubmit = async (
  txHash: string
): Promise<IRelaySubmitParams | undefined> => {
  const txData: IBitcoinBlockTx = (
    await axios.get(
      `https://mempool.space/${BITCOIN_TESTNET_REQUEST}api/tx/${txHash}`
    )
  ).data;
  const blockTxData: IBitcoinBlockDetail = (
    await axios.get(
      `https://mempool.space/${BITCOIN_TESTNET_REQUEST}api/block/${txData?.status.block_hash}`
    )
  ).data;
  const blockTxHeader: string = (
    await axios.get(
      `https://mempool.space/${BITCOIN_TESTNET_REQUEST}api/block/${txData?.status.block_hash}/header`
    )
  ).data;
  const blockTxIds: string[] = (
    await axios.get(
      `https://mempool.space/${BITCOIN_TESTNET_REQUEST}api/block/${txData.status.block_hash}/txids`
    )
  ).data;
  blockTxData.txs = blockTxIds;
  const txMerkleProof: IBitcoinTxMerkleProof = (
    await axios.get(
      `https://mempool.space/${BITCOIN_TESTNET_REQUEST}api/tx/${txHash}/merkle-proof`
    )
  ).data;
  console.log("#data", txData, blockTxData, blockTxHeader, blockTxIds.length);
  _extractMerkleProof(blockTxData);
  //   const params = _prepareSubmitTx(txParams);

  //   let outpoint: Outpoint = params.pubkeyPos ? [] : _prepareOutpointTx({
  //     ...outpointParams,
  //     txHash: txParams.txHash,
  //   });

  //   let bounty: Bounty = [];
  //   if (!bountyParams?.noBounty) {
  //     bounty = _prepareBountyTx(txParams);
  //     if (bounty.length > 0) {
  //       const inputs = bounty[0].inputs.map((i) => ({ ...i, pkhPos: 0 }));
  //       if (outpoint.length > 0) {
  //         inputs[params.inputIndex!].pkhPos = outpoint[0].pkhPos;
  //       }
  //       outpoint = inputs;
  //       delete bounty[0].inputs;
  //     }
  //   }
  //   return { params, outpoint, bounty };
  return undefined;
};

const _prepareSubmitParams = (abc: IInputTxParams) => {};
const prepareBountyTx = ({
  txHash,
}: IInputBountyParams): IParamBounty | undefined => {
  //   const txData = txs[txHash];
  //   if (!txData?.bounty) return [];

  //   const blockData = this.getBlock(txs[txData.bounty].block);
  //   const [merkleProof, merkleIndex] = getMerkleProof(blockData, txData.bounty);
  //   const [version, vin, vout, locktime] = this.extractTxParams(txs[txData.bounty].hex);

  //   const bounty = {
  //     header: "0x" + this.getHeader(txs[txData.bounty].block),
  //     merkleProof,
  //     merkleIndex,
  //     version: parseInt(version.toString(16).padStart(8, '0').reverse(), 16),
  //     locktime: parseInt(locktime.toString(16).padStart(8, '0').reverse(), 16),
  //     vin,
  //     vout,
  //     inputs: [],
  //   };

  //   const tx = bitcoinjs.Transaction.fromHex(txData.hex);
  //   for (const input of tx.ins) {
  //     const [version, vin, vout, locktime] = this.extractTxParams(txs[input.hash.reverse().toString("hex")].hex);
  //     bounty.inputs.push({
  //       version: parseInt(version.toString(16).padStart(8, '0').reverse(), 16),
  //       locktime: parseInt(locktime.toString(16).padStart(8, '0').reverse(), 16),
  //       vin,
  //       vout,
  //     });
  //   }

  //   return [bounty];
  return undefined;
};

const prepareOutpointTx = (
  params: IInputOutpointParams
): IParamOutpoint | undefined => {
  //   const txData = txs[params.txHash];
  //   const tx = bitcoinjs.Transaction.fromHex(txData.hex);

  //   const script = tx.ins[params.inputIdx!]?.script;
  //   if (script?.length) {
  //     if (script.length === 23 && script.slice(0, 3).toString("hex") === "160014") {
  //       return [];
  //     }
  //     if (script.length >= 38 && script[script.length - 38] === 0x21) {
  //       return [];
  //     }
  //   }

  //   const dxHash = params.dxHash ?? tx.ins[params.inputIdx!].hash.reverse().toString("hex");
  //   const dxMeta = txs[dxHash];
  //   if (!dxMeta) return [];

  //   const [version, vin, vout, locktime] = this.extractTxParams(dxMeta.hex);
  //   return [
  //     {
  //       version: parseInt(version.toString(16).padStart(8, '0').reverse(), 16),
  //       locktime: parseInt(locktime.toString(16).padStart(8, '0').reverse(), 16),
  //       vin,
  //       vout,
  //       pkhPos: params.pkhPos,
  //     },
  //   ];
  return undefined;
};

function _extractMerkleProof(block: IBitcoinBlockDetail) {
  const txs = block.txs
    .sort((a: string, b: string) => a - b) // confident that subtraction never overflows here
    .map((tx) => Buffer.from(tx, "hex").reverse().toString());

  // assertion: merkle root
  // const [root] = merkle.createRoot(Hash256, txs.slice())
  const leaves = txs.map((x) => SHA256(x));
  const tree = new MerkleTree(leaves, SHA256);
  const root = tree.getRoot().reverse().toString("hex");
  // if (Buffer.compare(Buffer.from(block.merkle_root, 'hex').reverse(),root) !== 0) {
  console.log(leaves, root.toString(), block.merkle_root);
  //   throw 'merkle root mismatch'
  // }

  // const branch = merkle.createBranch(Hash256, index, txs)
  // return Buffer.concat(branch)
}

if (!(String.prototype as any)?.reverseHex) {
  Object.defineProperty(String.prototype, "reverseHex", {
    enumerable: false,
    value: function () {
      const s = this.replace(/^(.(..)*)$/, "0$1"); // add a leading zero if needed
      const a = s.match(/../g); // split number in groups of two
      a.reverse(); // reverse the groups
      return a.join(""); // join the groups back together
    },
  });
}
