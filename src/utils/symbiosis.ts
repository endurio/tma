import erc20 from "@/abi/erc20.abi.json";
import {JSONProvider,symbiosis} from "@/config";
import {SwapExactInResultResponse,TokenConstructor} from "@/type";
import axios from "axios";
import {BigNumber,Contract,ethers,providers,Wallet} from "ethers";
import {Token} from "symbiosis-js-sdk";
import {NATIVE_ADDRESS,SYMBIOSIS_URL_API} from "./constant";
import {axiosErrorEncode} from "./utils";
import {toast} from "react-toastify";
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
  console.log('#symbiosisRequetsParams', symbiosisRequetsParams)
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

export const aprroveToSymbiosisContract = async ({tokenIn, signer, approveTo, tokenAmountIn, estimateOnly}: {tokenAmountIn: string, tokenIn: TokenConstructor, signer: Wallet, approveTo: string, estimateOnly?: boolean}) => {
  let isApprove = tokenIn.isNative || tokenIn.address === "";
    if (!isApprove) {
      const tokenInContract = new Contract(tokenIn.address, erc20, signer);
      const currentAllowance = await tokenInContract.allowance(signer.address, approveTo);

      if (BigNumber.from(currentAllowance).lt(BigNumber.from(tokenAmountIn))) {
          try {
            const estimatedGas = await tokenInContract.estimateGas.approve(approveTo, ethers.constants.MaxUint256);
          if(estimateOnly) return ''
          const approvalTx = await tokenInContract.approve(approveTo, ethers.constants.MaxUint256, {
            gasLimit: estimatedGas,
          });
          await approvalTx.wait();
          return ''
        } catch (error) {
          return axiosErrorEncode(error)
        }
        
      } else {
        return ''
      }
    }
    return ''
}
export const swapCrossChain = async ({
  tokenIn,
  tokenOut,
  tokenAmountIn,
  from,
  to,
  slippage,
  estimateOnly,
  approveOnly
}: {
  from: Wallet; // Ethers.js Wallet instance
  to: string; // Recipient address
  tokenIn: TokenConstructor;
  tokenAmountIn: string; // Amount in raw token units
  tokenOut: TokenConstructor;
  slippage?: number; // Optional slippage tolerance
  approveOnly?: boolean;
  estimateOnly?: boolean;
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
    const fromChainRPC = new providers.JsonRpcProvider(symbiosis.config.chains.filter(chain => chain.id === tokenIn.chainId)[0].rpc) || JSONProvider

    console.log(symbiosisSwapResult)
    const signer = new Wallet(from.privateKey, fromChainRPC);
    if(approveOnly) {
     const approveStatus =  await aprroveToSymbiosisContract({
          tokenIn,
          tokenAmountIn,
          signer,
          estimateOnly,
          approveTo
      })
    return approveStatus
    }
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
    toast(`<div> Transaction submitted successfully. View details on the <a href="https://https://arbiscan.io/tx/${receipt.transactionHash}" target="_blank" rel="noopener noreferrer" style={{ color: "#f0ad4e", textDecoration: "underline" }}>blockchain explorer</a>.</div>`,{type: 'success'});
    console.log("Swap Tx Confirmed:", receipt.transactionHash);

    return {
      ...symbiosisSwapResult,
      estimatedGas,
      receipt
    }
  } catch (error:any) {
    if(!estimateOnly) {
      toast(axiosErrorEncode(error),{type: 'error'})
    }
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