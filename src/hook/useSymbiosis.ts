import {useWeb3Account} from "@/components/AccountManagement/hook/useWeb3Account";
import {SwapExactInResultResponse} from "@/type";
import {buildConstructorTokens, findSymbiosisTokens,swapCrossChain} from "@/utils/symbiosis";
import {axiosErrorEncode} from "@/utils/utils";
import {BigNumber,providers} from "ethers";
import {useState} from "react";
import {ChainId,Token} from "symbiosis-js-sdk";

export const useSymbiosis = () => {
  const { account } = useWeb3Account();
  const [swapResult, setSwapResult] = useState<SwapExactInResultResponse & {receipt: providers.TransactionReceipt} | BigNumber | string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const performSwap = async ({tokenIn, tokenOut, tokenInAmount, slippage, estimateOnly}: {tokenIn: Token, tokenOut: Token, tokenInAmount: string, slippage?: number, estimateOnly?: boolean }) => {
    try {
      setLoading(true);
      setError('');

      const tokenInConstructor = findSymbiosisTokens({
        tokenAddress: tokenIn.address,
        symbol: tokenIn.symbol ?? 'ETH',
        name: tokenIn.name,
        chainId: tokenIn.chainId,
      })[0] || buildConstructorTokens(tokenIn);
      const tokenOutConstructor = findSymbiosisTokens({
        tokenAddress: tokenOut.address,
        symbol: tokenOut.symbol ?? 'BTC',
        name: tokenOut.name,
        chainId: tokenOut.chainId,
      })[0] || buildConstructorTokens(tokenOut);

      if (!tokenIn || !tokenOut) {
        throw new Error("Token details not found for swap.");
      }

      const tokenInAmountWithDecimals = String(Number(tokenInAmount) * 10 ** (tokenIn?.decimals || 18));
      if (tokenIn.isNative) tokenInConstructor.address = "";
      if (tokenOut.isNative) tokenOutConstructor.address = "";

      if (!account) {
        throw new Error("Account not initialized.");
      }
      const params = {
        tokenIn: tokenInConstructor,
        tokenOut: tokenOutConstructor,
        tokenInAmount: tokenInAmountWithDecimals,
        from: account.evmSigner,
        estimateOnly,
        to: tokenOut.chainId === ChainId.BTC_MAINNET ? account.btcAddress : account.evmAddress,
        slippage: (slippage || 1) * 100,
      }
      console.log('#params', params)
      const result = await swapCrossChain(params);
      console.log('#result', result)
      if (typeof result === "string") {
        setError(result);
      } else if (BigNumber.isBigNumber(result)) {
        setSwapResult(result as BigNumber);
      } else {
        setSwapResult(result as SwapExactInResultResponse & {receipt: providers.TransactionReceipt} );
      }
    } catch (err: any) {
      console.error("Swap error:", err);
      setError(axiosErrorEncode(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    performSwap,
    swapResult,
    swapLoading: loading,
    swapError: error,
  };
};
