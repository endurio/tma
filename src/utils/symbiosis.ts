import erc20 from "@/abi/erc20.abi.json";
import {JSONProvider,symbiosis} from "@/config";
import {SwapExactInResultResponse,TokenConstructor} from "@/type";
import axios from "axios";
import {BigNumber,Contract,providers,Wallet} from "ethers";
import {NATIVE_ADDRESS, SYMBIOSIS_URL_API} from "./constant";
import {axiosErrorEncode} from "./utils";
import {ChainId, Token} from "symbiosis-js-sdk";
export const fetchSymbiosisRouter = async ({
  tokenIn,
  tokenOut,
  tokenAmountIn,
  from,
  to,
  slippage,
}: {
  from: string;
  to: string;
  tokenIn: TokenConstructor;
  tokenAmountIn: string;
  tokenOut: TokenConstructor;
  slippage?: number;
}): Promise<SwapExactInResultResponse | String> => {
  const symbiosisRequetsParams = {
    tokenAmountIn: {
      ...tokenIn,
      amount: tokenAmountIn,
    },
    tokenOut,
    selectMode: "best_return",
    from,
    to,
    slippage: slippage || 100,
  };
  try {
    const res = await axios.post(SYMBIOSIS_URL_API, symbiosisRequetsParams, {
      headers: {
        'accept': '*/*', 
        'content-type': 'application/json', 
        // 'origin': 'https://app.symbiosis.finance', 
      }
    });
    const symbiosisSwapResult: SwapExactInResultResponse = res?.data
    return symbiosisSwapResult
  } catch (error:any) {
    return axiosErrorEncode(error)
  }
};


export const swapCrossChain = async ({
  tokenIn,
  tokenOut,
  tokenAmountIn,
  from,
  to,
  slippage,
  estimateOnly,
}: {
  from: Wallet; // Ethers.js Wallet instance
  to: string; // Recipient address
  tokenIn: TokenConstructor;
  tokenAmountIn: string; // Amount in raw token units
  tokenOut: TokenConstructor;
  slippage?: number; // Optional slippage tolerance
  estimateOnly?: boolean
}): Promise<SwapExactInResultResponse & {receipt?: providers.TransactionReceipt, estimatedGas?: BigNumber} | string> => {
  try {
    const symbiosisSwapResult = (await fetchSymbiosisRouter({
      tokenIn,
      tokenOut,
      tokenAmountIn,
      from: from.address,
      to,
      slippage,
    })) as SwapExactInResultResponse;
    console.log('#symbiosisSwapResult', symbiosisSwapResult)
    if (!symbiosisSwapResult.routes) {
      return (symbiosisSwapResult as any)?.message;
    }

    const { tx, approveTo } = symbiosisSwapResult;
    const data = tx.data;
    const toAddress = tx.to;
    const value = tx.value;
    console.log(symbiosisSwapResult)
    let isApprove = tokenIn.isNative || tokenIn.address === "";
    if (!isApprove) {
      const tokenInContract = new Contract(tokenIn.address, erc20, from);
      const currentAllowance = await tokenInContract.allowance(from.address, approveTo);

      if (BigNumber.from(currentAllowance).lt(BigNumber.from(tokenAmountIn))) {
        console.log("Allowance insufficient, approving...");
        const estimatedGas = await tokenInContract.estimateGas.approve(approveTo, tokenAmountIn);
        const approvalTx = await tokenInContract.approve(approveTo, tokenAmountIn, {
          gasLimit: estimatedGas,
        });
        console.log("Approval Tx:", approvalTx.hash);
        await approvalTx.wait();
        console.log("Approval confirmed.");
      } else {
        console.log("Approval not needed.");
      }
    }
    const fromChainRPC = new providers.JsonRpcProvider(symbiosis.config.chains.filter(chain => chain.id === tokenIn.chainId)[0].rpc) || JSONProvider
    const signer = new Wallet(from.privateKey, fromChainRPC);
    const estimatedGas = await signer.estimateGas({
      to: toAddress,
      data,
      value: BigNumber.from(value || "0"),
    });
    console.log("Estimated Gas:", estimatedGas.toString());
    if(estimateOnly) return {
      estimatedGas,
      ...symbiosisSwapResult
    }

    const swapTx = await signer.sendTransaction({
      to: toAddress,
      data,
      value: BigNumber.from(value || "0"),
      gasLimit: estimatedGas,
    });

    console.log("Swap Tx Sent:", swapTx.hash);

    const receipt = await swapTx.wait();
    console.log("Swap Tx Confirmed:", receipt.transactionHash);

    return {
      ...symbiosisSwapResult,
      estimatedGas,
      receipt
    }
  } catch (error:any) {
    console.error("Swap Cross Chain Error:", error);
    return axiosErrorEncode(error)
  }
};
export const buildConstructorTokens = (token: Token): TokenConstructor => {
  return {
      name: token.name ?? token.symbol,
      symbol: token.symbol,
      address: token.address === NATIVE_ADDRESS ? '' : token.address,
      decimals: token.decimals,
      chainId: token.chainId,
      isNative: token.isNative,
    }
}
export const findSymbiosisTokens = ({
    tokenAddress,
    symbol,
    name,
    chainId,
  }: {
    tokenAddress: string;
    symbol: string;
    name?: string;
    chainId: number;
  }): TokenConstructor[] => {
    const chain = symbiosis.config.chains.find(
      (chain) => chain.id === Number(chainId)
    );

    if (!chain) return [];
  
    const { stables } = chain;
    const tokensByAddress = stables.filter((stable => stable.address.toLowerCase() === tokenAddress.toLowerCase()))
    if(tokensByAddress.length > 0) return tokensByAddress
    const tokensBySymbol = stables.filter(stable => stable.symbol?.includes(symbol))
    if(tokensBySymbol.length > 0) return tokensBySymbol
    const tokensByName = name ? stables.filter(stable => stable.name?.includes(name)) : []
    if(tokensByName.length > 0) return tokensByName
    return []
}