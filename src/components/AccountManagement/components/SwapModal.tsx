import {
  Button,
  Cell,
  Chip,
  Input,
  List,
  Modal,
  Section,
  Select,
} from "@telegram-apps/telegram-ui";
import { useEffect, useMemo, useState } from "react";

import { Iconify } from "@/components/iconify";
import { JSONProvider } from "@/config";
import { useSymbiosis } from "@/hook/useSymbiosis";
import "@/pages/IndexPage/IndexPage.css";
import {
  ICONIFY_SIZE_LG,
  ICONIFY_SIZE_MD,
  ICONIFY_SIZE_SM,
  NATIVE_ADDRESS,
  WHITELIST_TOKEN,
} from "@/utils/constant";
import { ChainId, Token } from "symbiosis-js-sdk";
import "./index.css";
import { useWeb3Account } from "../hook/useWeb3Account";
import { wei, zerofy } from "@/utils/utils";
import { SwapExactInResultResponse } from "@/type";
import { BigNumber, providers } from "ethers";
let _modal: (props: { visible: boolean }) => void;

export const SwapModal = () => {
  const [visible, setVisible] = useState(true);
  const [tokenAmountIn, setTokenAmountIn] = useState<string>("");
  //   const [tokenAmountOut, settokenAmountOut] = useState<string>("");

  const [inputToken, setInputToken] = useState<string>("ETH");

  const { account } = useWeb3Account();
  const [outputToken, setOutputToken] = useState<string>("BTC");
  const { performSwap, swapLoading, swapError, swapResult } = useSymbiosis();

  const tokensConstructions = useMemo(() => {
    const wlTokenIn = WHITELIST_TOKEN[inputToken];
    const wlTokenOut = WHITELIST_TOKEN[outputToken];
    if (!wlTokenIn || !wlTokenOut) return null;

    const tokenIn = new Token({
      address: wlTokenIn.address,
      isNative: wlTokenIn.address === NATIVE_ADDRESS,
      symbol: inputToken,
      chainId: wlTokenIn.chainId,
      decimals: wlTokenIn.decimals,
    });

    const tokenOut = new Token({
      address: wlTokenOut.address,
      isNative: wlTokenOut.address === NATIVE_ADDRESS,
      symbol: outputToken,
      chainId: wlTokenOut.chainId,
      decimals: wlTokenOut.decimals,
    });

    return { tokenIn, tokenOut };
  }, [inputToken, outputToken]);
  const isPreError = useMemo(() => {
    if (!Number(tokenAmountIn) || tokenAmountIn === "" || tokenAmountIn === "0")
      return true;
    if (!tokensConstructions) return true;
    return false;
  }, [tokenAmountIn, tokensConstructions]);
  const handleBlur = () => {
    if (tokensConstructions && tokenAmountIn) {
      const { tokenIn, tokenOut } = tokensConstructions;
      performSwap({
        tokenIn,
        tokenAmountIn: String(tokenAmountIn),
        tokenOut,
        estimateOnly: true,
      });
    }
  };

  const sendSwapTx = async () => {
    if (!tokensConstructions) return;
    const { tokenIn, tokenOut } = tokensConstructions;
    if (swapLoading === false && swapError === "")
      performSwap({ tokenIn, tokenAmountIn: String(tokenAmountIn), tokenOut });
  };
  useEffect(() => {
    _modal = ({ visible }: { visible: boolean }) => {
      setVisible(visible);
    };
  }, []);

  useEffect(() => {
    if (visible) window.scrollTo(0, 0);
  }, [visible]);

  const { tokenAmountOut } = useMemo(() => {
    console.log("#swapResults", swapResult);
    if (!swapResult || isPreError) return { tokenAmountOut: "" };
    const swapResWithType = swapResult as SwapExactInResultResponse;
    const tokenAmountOutMin = String(
      Number(swapResWithType?.tokenAmountOutMin?.amount) /
        10 ** swapResWithType?.tokenAmountOutMin?.decimals || ""
    );
    const tokenAmountOut = String(
      Number(swapResWithType?.tokenAmountOutMin?.amount) /
        10 ** swapResWithType?.tokenAmountOutMin?.decimals || ""
    );
    return {
      tokenAmountOut: tokenAmountOut ?? tokenAmountOutMin ?? "",
    };
  }, [swapResult, tokenAmountIn, swapLoading, isPreError]);
  const swapResultWithType = swapResult as SwapExactInResultResponse & {
    receipt?: providers.TransactionReceipt;
    estimatedGas?: BigNumber;
  };
  return (
    <Modal open={visible} trigger={undefined} onOpenChange={setVisible}>
      <Section>
        <List>
          <div>
            <Cell
              style={{ textAlign: "right", background: "none" }}
              description={
                <div
                  onClick={() => {
                    if (!tokensConstructions) return;
                    const { tokenIn, tokenOut } = tokensConstructions;
                    const _tokenAmountIn =
                      inputToken === "BTC"
                        ? String((account?.btcDisplayBalance ?? 0) * 0.95)
                        : zerofy(
                            Number(
                              Number(
                                account?.balances[
                                  WHITELIST_TOKEN[inputToken].address
                                ] ?? 0
                              ) * 0.95
                            ) /
                              10 ** WHITELIST_TOKEN[inputToken].decimals
                          );
                    setTokenAmountIn(_tokenAmountIn);
                    performSwap({
                      tokenIn,
                      tokenAmountIn: String(_tokenAmountIn),
                      tokenOut,
                      estimateOnly: true,
                    });
                  }}
                >
                  Balance:{" "}
                  {inputToken === "BTC"
                    ? zerofy(account?.btcDisplayBalance ?? 0)
                    : zerofy(
                        Number(
                          account?.balances[
                            WHITELIST_TOKEN[inputToken].address
                          ] ?? 0
                        ) /
                          10 ** WHITELIST_TOKEN[inputToken].decimals
                      )}
                </div>
              }
            ></Cell>
            <Input
              className="w-100"
              value={tokenAmountIn}
              style={{
                fontSize: tokenAmountIn ? ICONIFY_SIZE_LG : ICONIFY_SIZE_MD,
              }}
              after={
                <Chip
                  style={{ borderRadius: "20px" }}
                  before={
                    <Iconify
                      icon={`token-branded:${inputToken.toLowerCase()}`}
                    />
                  }
                >
                  {inputToken}
                </Chip>
              }
              //   before={
              //     <Select
              //       className="tab-dropdown-button"
              //       style={{padding: 0}}
              //       value={inputToken}
              //       before={
              //         <Iconify
              //           icon={`token-branded:${inputToken.toLowerCase()}`}
              //           height={ICONIFY_SIZE_MD}
              //           width={ICONIFY_SIZE_MD}
              //         />
              //       }
              //       style={{ cursor: "pointer" }}
              //       onChange={(e) => {
              //         setInputToken(e.currentTarget.value);
              //       }}
              //     >
              //       {Object.keys(WHITELIST_TOKEN).map((symbol, _) => {
              //         return (
              //           <option key={symbol} value={symbol}>
              //             {symbol}
              //           </option>
              //         );
              //       })}
              //     </Select>
              //   }
              onChange={(e) => setTokenAmountIn(e.target.value)}
              placeholder="Input amount..."
              onBlur={handleBlur}
            />
          </div>

          {/* <div
            className="w-100"
            style={{
              textAlign: "center",
              background: "none",
            }}
          >
            {" "}
            <Iconify
              icon="material-symbols:swap-vert-rounded"
              width={ICONIFY_SIZE_MD}
              height={ICONIFY_SIZE_MD}
            />
          </div> */}

          <div>
            <Cell
              style={{ textAlign: "right", background: "none" }}
              description={
                <div>
                  Balance:{" "}
                  {outputToken === "BTC"
                    ? zerofy(account?.btcDisplayBalance ?? 0)
                    : zerofy(
                        Number(
                          account?.balances[
                            WHITELIST_TOKEN[outputToken].address
                          ] ?? 0
                        ) /
                          10 ** WHITELIST_TOKEN[outputToken].decimals
                      )}
                </div>
              }
            ></Cell>
            <Input
              className="w-100"
              style={{
                fontSize: !tokenAmountOut && swapLoading ? ICONIFY_SIZE_MD : ICONIFY_SIZE_LG,
              }}
              value={tokenAmountOut}
              //   before={
              //     <Chip
              //     style={{ borderRadius: "10px" }}
              //   >
              //      <Iconify
              //         icon={`token-branded:${WHITELIST_TOKEN[outputToken].chainId === ChainId.ARBITRUM_MAINNET ? 'arbi' : 'btc'}`}
              //       />
              //   </Chip>
              //   }
              after={
                <Chip
                  style={{ borderRadius: "20px" }}
                  before={
                    <Iconify
                      icon={`token-branded:${outputToken.toLowerCase()}`}
                    />
                  }
                >
                  {outputToken}
                </Chip>
              }
              //   before={
              // <Select
              //   className="tab-dropdown-button"
              //   value={outputToken}
              //   before={
              //     <Iconify
              //       icon={`token-branded:${outputToken.toLowerCase()}`}
              //       height={ICONIFY_SIZE_MD}
              //       width={ICONIFY_SIZE_MD}
              //     />
              //   }
              //   style={{ cursor: "pointer" }}
              //   onChange={(e) => {
              //     setOutputToken(e.currentTarget.value);
              //   }}
              // >
              //   {Object.keys(WHITELIST_TOKEN).map((symbol, _) => {
              //     return (
              //       <option key={symbol} value={symbol}>
              //         {symbol}
              //       </option>
              //     );
              //   })}

              // </Select>
              //   }
              //   onChange={(e) => setTokenAmountIn(e.target.value)}
              placeholder={swapLoading ? "Finding best rates..." : ""}
              onBlur={handleBlur}
            />
            {/* <Chip
            style={{ background: "none", border: "none" }}
            after={
              <Select
                className="tab-dropdown-button"
                value={outputToken}
                before={
                  <Iconify
                    icon={`token-branded:${outputToken.toLowerCase()}`}
                    height={ICONIFY_SIZE_MD}
                    width={ICONIFY_SIZE_MD}
                  />
                }
                style={{ cursor: "pointer", fontSize: ICONIFY_SIZE_SM }}
                onChange={(e) => {
                  setOutputToken(e.currentTarget.value);
                }}
              >
                {Object.keys(WHITELIST_TOKEN).map((symbol, _) => {
                  return (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  );
                })}
              </Select>
            }
          >
            <Input
              className="w-100"
              disabled
              //   value={tokenAmountIn}
              //   onChange={(e) => setTokenAmountIn(e.target.value)}
              placeholder={swapLoading ? "Fetching best price..." : ""}
              onBlur={handleBlur}
            />
          </Chip> */}
          </div>

          <Button
            className="w-100"
            disabled={
              isPreError ||
              swapError?.length > 0 ||
              swapLoading ||
              !tokenAmountIn
            }
            onClick={sendSwapTx}
          >
            {swapLoading ? "Loading..." : swapError || "Swap"}
          </Button>
          {swapResultWithType?.routes && !isPreError && swapError === "" ? (
            <div>
              <Cell
                subtitle="Estimate time:"
                after={`~${swapResultWithType?.estimatedTime}s`}
              ></Cell>
              <Cell
                subtitle="Estimate gas:"
                after={`${zerofy(Number(swapResultWithType?.fee?.amount) / 10 ** swapResultWithType?.fee?.decimals)} ${swapResultWithType?.fee?.symbol}`}
              ></Cell>
            </div>
          ) : (
            ""
          )}
        </List>
      </Section>
    </Modal>
  );
};

export const swapModal = async (visible: boolean) => {
  _modal({ visible });
};
