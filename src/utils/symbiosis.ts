import axios from "axios";
import { SwapExactInParams, SwapExactInResult, Token, TokenAmount } from "symbiosis-js-sdk";
import { SYMBIOSIS_URL_API } from "./constant";
import {TokenConstructor} from "@/type";
import {symbiosis} from "@/config";
import {axiosErrorEncode} from "./utils";

export const swapCrossChain = async ({
  tokenIn,
  tokenOut,
  tokenInAmount,
  from,
  to,
  slippage,
}: {
  from: string;
  to: string;
  tokenIn: TokenConstructor;
  tokenInAmount: string;
  tokenOut: TokenConstructor;
  slippage?: number;
}): Promise<SwapExactInResult | String> => {
  const symbiosisRequetsParams = {
    tokenAmountIn: {
      ...tokenIn,
      amount: tokenInAmount,
    },
    tokenOut,
    from,
    to,
    slippage: slippage || 100,
  };
  console.log('#symbiosisRequetsParams', symbiosisRequetsParams)
  try {
    const res = await axios.post(SYMBIOSIS_URL_API, symbiosisRequetsParams, {});
    const symbiosisSwapResult: SwapExactInResult = res?.data
    return symbiosisSwapResult
  } catch (error:any) {
    return JSON.stringify(axiosErrorEncode(error))
  }
};

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