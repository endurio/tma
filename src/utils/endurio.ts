import {BITCOIN_TESTNET_REQUEST} from "@/hook/useBitcoinNetwork";
import {
  IBitcoinBlockDetail,
  IBitcoinBlockTx,
  IBitcoinTxMerkleProof,
  IInputBountyParams,
  IInputOutpointParams,
  IInputTxParams,
  IParamOutpoint,
  IRelaySubmitParams
} from "@/type";
import axios from "axios";
import {hash256} from "bitcoinjs-lib/src/crypto";
import {Buffer} from "buffer";
import {MerkleTree} from "merkletreejs";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const prepareSubmit = async (
  txHash: string
): Promise<IRelaySubmitParams> => {
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
  const txIndex = txMerkleProof.pos;
  const merkProof = extractMerkleProof(txMerkleProof);
  _extractMerkleProof(blockTxData, txData.txid);
  const memo = extractMemo(txData);
  console.log("#Transaction Details:", {
    transaction: txData,
    memo,
    blockData: blockTxData,
    blockHeader: blockTxHeader,
    totalTxs: blockTxIds.length,
    merkleProof: txMerkleProof,
    extractedProof: merkProof,
    transactionIndex: txIndex,
  });
  const params = prepareSubmitParams({
    tx: txData,
    txMerkleProof,
    block: blockTxData,
    inputIndex: 0,
  });
  const outpoint = params.pubkeyPos
    ? []
    : await prepareOutpointParams({ tx: txData });
  const bounty = await prepareBountyParams({tx: txData, txMerkleProof, block: blockTxData})
  console.log("#Transaction Submit", params, outpoint, bounty);
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
  return [params, outpoint, bounty];
};

function prepareSubmitParams({
  tx,
  block,
  txMerkleProof,
  inputIndex = 0,
}: IInputTxParams) {
  const merkleProof = extractMerkleProof(txMerkleProof);
  const { version, vin, vout, locktime } = tx;
  const brand = extractMemo(tx) ?? "";
  const memoLength = brand.length;
  const script = Buffer.from(tx.vin[inputIndex].scriptsig, "hex");
  const pubkeyPos = findPubKeyPos(script);

  function findPubKeyPos(script: Buffer<ArrayBuffer>) {
    const sigLen = script[0];
    if (script[sigLen + 1] != 33) {
      return 0; // not a pubkey
    }
    return sigLen + 2;
  }
  const payer = tx.vout[tx.vout.length - 1].scriptpubkey_address;

  return {
    header: extractHeader(block) || "0x" + block.merkle_root,
    merkleIndex: txMerkleProof.pos,
    merkleProof,
    version: parseInt(
      (version.toString(16).padStart(8, "0") as any).reverseHex(),
      16
    ),
    locktime: parseInt(
      (locktime.toString(16).padStart(8, "0") as any).reverseHex(),
      16
    ),
    vin,
    vout,
    memoLength,
    inputIndex,
    pubkeyPos,
    payer,
  };
}
async function prepareOutpointParams({
  tx,
  inputIdx = 0,
  pkhPos = 0,
}: IInputOutpointParams) {
  const script = Buffer.from(tx.vin[inputIdx].scriptsig, "hex");
  if (script && script.length > 0) {
    if (script.length == 23 && script.slice(0, 3).toString("hex") == "160014") {
      // redeem script for P2SH-P2WPKH
      return [];
    }
    if (
      script.length >= 33 + 4 &&
      script[script.length - 33 - 4 - 1] === 0x21
    ) {
      // redeem script for P2PKH
      return [];
    }
    console.error(script.length);
    console.error(script.toString("hex"));
  }

  const input = tx.vin[inputIdx];
  const dxHash = input?.txid;
  // dependency tx
  const dx: IBitcoinBlockTx = (
    await axios.get(
      `https://mempool.space/${BITCOIN_TESTNET_REQUEST}api/tx/${dxHash}`
    )
  ).data;
  console.log("#Transaction dx", dx);
  if (!dx) {
    return []; // there's no data for dx here
  }
  const { version, vin, vout, locktime } = dx;

  return [
    {
      version: parseInt(
        (version.toString(16).padStart(8, "0") as any).reverseHex(),
        16
      ),
      locktime: parseInt(
        (locktime.toString(16).padStart(8, "0") as any).reverseHex(),
        16
      ),
      vin,
      vout,
      pkhPos,
    },
  ];
}

async function prepareBountyParams({
  tx,
  txMerkleProof,
  block,
}: IInputBountyParams) {
  const samplingIndex =
    1 + Number(BigInt("0x" + block.id) % BigInt(tx.vout.length - 2));
  const samplingOutput = tx.vout[samplingIndex];
  const recipient = samplingOutput.scriptpubkey_address;
  // let recipientTx;
  // for (let offset = 0; !recipientTx; offset+= 50) {
  //   const recipientTxs = await client.getTxs(recipient, 50, offset)
  //   // TODO: properly find the correct bounty referenced tx instead of blindly pick the last one with no OP_RET
  //   if (!recipientTxs || recipientTxs.length == 0) {
  //     break // no more history to scan
  //   }
  //   recipientTx = recipientTxs.find(t => {
  //     const hasOpRet = t.outputs.some(o => o.script.startsWith('6a'))
  //     return !hasOpRet
  //   })
  // }
  // if (!recipientTx) {
  //   throw '!recipientTx'
  // }
  // const recipientBlock = await client.getBlock(recipientTx.blockNumber)
  const merkleProof = extractMerkleProof(txMerkleProof);
  const { version, vin, vout, locktime } = tx;
  const bounty: any = {
    header: "0x" + block.merkle_root,
    merkleProof,
    merkleIndex: txMerkleProof.pos,
    version: parseInt(
      (version.toString(16).padStart(8, "0") as any).reverseHex(),
      16
    ),
    locktime: parseInt(
      (locktime.toString(16).padStart(8, "0") as any).reverseHex(),
      16
    ),
    vin,
    vout,
    inputs: [],
  };

  for (const input of tx.vin) {
    //   const prevTx = await client.getTx(input.prevout.hash)
    const txData: IBitcoinBlockTx = (
      await axios.get(
        `https://mempool.space/${BITCOIN_TESTNET_REQUEST}api/tx/${input.txid}`
      )
    ).data;
    const { version, vin, vout, locktime } = txData;
    bounty.inputs.push({
      version: parseInt(
        (version.toString(16).padStart(8, "0") as any).reverseHex(),
        16
      ),
      locktime: parseInt(
        (locktime.toString(16).padStart(8, "0") as any).reverseHex(),
        16
      ),
      vin,
      vout,
    });
  }

  return [bounty];
}
// const prepareBountyTx = ({
//   txHash,
// }: IInputBountyParams): IParamBounty | undefined => {
//   //   const txData = txs[txHash];
//   //   if (!txData?.bounty) return [];

//   //   const blockData = this.getBlock(txs[txData.bounty].block);
//   //   const [merkleProof, merkleIndex] = getMerkleProof(blockData, txData.bounty);
//   //   const [version, vin, vout, locktime] = this.extractTxParams(txs[txData.bounty].hex);

//   //   const bounty = {
//   //     header: "0x" + this.getHeader(txs[txData.bounty].block),
//   //     merkleProof,
//   //     merkleIndex,
//   //     version: parseInt(version.toString(16).padStart(8, '0').reverse(), 16),
//   //     locktime: parseInt(locktime.toString(16).padStart(8, '0').reverse(), 16),
//   //     vin,
//   //     vout,
//   //     inputs: [],
//   //   };

//   //   const tx = bitcoinjs.Transaction.fromHex(txData.hex);
//   //   for (const input of tx.ins) {
//   //     const [version, vin, vout, locktime] = this.extractTxParams(txs[input.hash.reverse().toString("hex")].hex);
//   //     bounty.inputs.push({
//   //       version: parseInt(version.toString(16).padStart(8, '0').reverse(), 16),
//   //       locktime: parseInt(locktime.toString(16).padStart(8, '0').reverse(), 16),
//   //       vin,
//   //       vout,
//   //     });
//   //   }

//   //   return [bounty];
//   return undefined;
// };

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

function _extractMerkleProof(block: IBitcoinBlockDetail, txHash: string) {
  const txIndex = block.txs.findIndex((tx) => tx === txHash);
  const txs = block.txs.map((tx) => Buffer.from(tx, "hex").reverse());

  //   const leaf = txs.map((x) => x);
  const tree = new MerkleTree(txs, hash256, { isBitcoinTree: true });
  const root = tree.getRoot().toString("hex");
  const proof = tree.getProof(txHash);
  console.log("#check", root, block.merkle_root);
  return Buffer.concat(proof.map((p) => p.data));
}

function extractMerkleProof(proofs: IBitcoinTxMerkleProof) {
  return Buffer.concat(proofs.merkle.map((m) => Buffer.from(m, "hex")));
}
function extractMemo(tx: IBitcoinBlockTx): string | undefined {
  // Find the index of the output with OP_RETURN script
  const memoIndex = tx.vout.findIndex((vout) =>
    vout.scriptpubkey.startsWith("6a")
  ); // OP_RETURN

  if (memoIndex === -1) {
    return undefined; // No OP_RETURN output found
  }

  const script = Buffer.from(tx.vout[memoIndex].scriptpubkey, "hex");
  const len = script[1];
  const memo = script.slice(2, 2 + len).toString();

  return memo && memo.includes(" ")
    ? memo.substring(0, memo.indexOf(" "))
    : memo;
}

function extractHeader(block: IBitcoinBlockDetail) {
  const { version, previousblockhash, merkle_root, timestamp, bits, nonce } =
    block;
  return (
    "".concat(
      nonce.toString(16).padStart(8, "0"),
      bits.toString(16).padStart(8, "0"),
      timestamp.toString(16).padStart(8, "0"),
      merkle_root,
      previousblockhash,
      version.toString(16).padStart(8, "0")
    ) as any
  ).reverseHex();
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
