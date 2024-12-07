import {
  Button,
  Cell,
  Chip,
  Input,
  List,
  Modal,
  Section,
  Text
} from "@telegram-apps/telegram-ui";
import {useEffect,useMemo,useState} from "react";

import {Iconify} from "@/components/iconify";
import {useSymbiosis} from "@/hook/useSymbiosis";
import {useTokensPrice} from "@/hook/useTokensPrice";
import "@/pages/IndexPage/IndexPage.css";
import {SwapExactInResultResponse} from "@/type";
import {
  FONT_SIZE_LG,
  FONT_SIZE_MD,
  FONT_SIZE_SM,
  NATIVE_ADDRESS,
  WHITELIST_TOKEN,
} from "@/utils/constant";
import {zerofy} from "@/utils/utils";
import {BigNumber,providers} from "ethers";
import {Token} from "symbiosis-js-sdk";
import {useWeb3Account} from "../hook/useWeb3Account";
import "./index.css";
let _modal: (props: { visible: boolean }) => void;

export const SwapModal = () => {
  const [visible, setVisible] = useState(false);
  const [tokenAmountIn, setTokenAmountIn] = useState<string>("");
  //   const [tokenAmountOut, settokenAmountOut] = useState<string>("");

  const [inputToken, setInputToken] = useState<string>("USDC");
  const [outputToken, setOutputToken] = useState<string>("ETH");
  const [selectTokenVisible, setSelectVisible] = useState(false);
  const [selectTokenFunction, setSelectTokenFunction] = useState<'input' | 'output'>('input');

  const { account } = useWeb3Account();
  
  const { performSwap, swapLoading, swapError, swapResult } = useSymbiosis();
  const { tokenPrices } = useTokensPrice();
  const isNeedToApprove = useMemo(() => {
    if (swapError.toLowerCase().includes("amount exceeds allowance")) {
      return true;
    }
    return false;
  }, [swapError]);

  useEffect(() => {
    console.log("#isNeedToApprove", isNeedToApprove);
  }, [isNeedToApprove]);
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
    const _tokenAmountIn = tokenAmountIn;
    if (tokensConstructions && _tokenAmountIn) {
      const { tokenIn, tokenOut } = tokensConstructions;
      performSwap({
        tokenIn,
        tokenAmountIn: String(_tokenAmountIn),
        tokenOut,
        approveOnly: isNeedToApprove,
        estimateOnly: true,
      });
    }
  };

  const sendSwapTx = async () => {
    // const _tokensConstructions = tokensConstructionsOvveride || tokensConstructions
    if (!tokensConstructions) return;
    const { tokenIn, tokenOut } = tokensConstructions;
    if (swapLoading === false && (isNeedToApprove || swapError === ""))
      performSwap({
        tokenIn,
        tokenAmountIn: String(tokenAmountIn),
        tokenOut,
        approveOnly: isNeedToApprove,
        estimateOnly: false,
      }).then(() => {
        setTokenAmountIn("");
        setVisible(false);
      });
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
  const handleTokenChange = (type: 'input' | 'output', token: string) => {
    const [_inputToken, _outputToken] = [inputToken, outputToken]
    let isChange = false
    if (type === 'input' && token === _outputToken) {
      setInputToken(_outputToken)
      setOutputToken(_inputToken)
      isChange = true
    } else if (type === 'output' && token === _inputToken) {
      setInputToken(_outputToken)
      setOutputToken(_inputToken)
      isChange = true
    } else {
      isChange = true
      if (type === 'input') setInputToken(token);
      else setOutputToken(token);
    }
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
                    // handleBlur(_tokenAmountIn)
                    performSwap({
                      tokenIn,
                      tokenAmountIn: String(_tokenAmountIn),
                      tokenOut,
                      approveOnly: isNeedToApprove,
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
                fontSize: tokenAmountIn ? FONT_SIZE_LG : FONT_SIZE_MD,
              }}
              after={
                <div style={{ display: "flex" }}>
                  <Chip style={{ background: "none" }}>
                    {tokenAmountIn ? (
                      <Text style={{ fontSize: FONT_SIZE_SM }}>{`($${zerofy(
                        tokenPrices[inputToken] * Number(tokenAmountIn)
                      )})`}</Text>
                    ) : (
                      ""
                    )}
                  </Chip>
                  <Chip
                    onClick={() => {
                      setSelectTokenFunction('input')
                      setSelectVisible(true)
                    }}
                    style={{ borderRadius: "20px" }}
                    before={
                      <Iconify
                        icon={`token-branded:${inputToken.toLowerCase()}`}
                      />
                    }
                  >
                    {inputToken}
                  </Chip>
                </div>
              }
              onChange={(e) => setTokenAmountIn(e.target.value)}
              placeholder="Input amount..."
              onBlur={handleBlur}
            />
          </div>

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
                fontSize: swapError
                  ? FONT_SIZE_MD
                  : tokenAmountOut
                  ? FONT_SIZE_LG
                  : FONT_SIZE_MD,
              }}
              value={tokenAmountOut}
              after={
                <div style={{ display: "flex" }}>
                  <Chip style={{ background: "none" }}>
                    {tokenAmountOut ? (
                      <Text style={{ fontSize: FONT_SIZE_SM }}>{`($${zerofy(
                        tokenPrices[outputToken] * Number(tokenAmountOut)
                      )})`}</Text>
                    ) : (
                      ""
                    )}
                  </Chip>
                  <Chip
                    onClick={() => {
                      setSelectTokenFunction('output')
                      setSelectVisible(true)
                    }}
                    style={{ borderRadius: "20px" }}
                    before={
                      <Iconify
                        icon={`token-branded:${outputToken.toLowerCase()}`}
                      />
                    }
                  >
                    {outputToken}
                  </Chip>
                </div>
              }
              placeholder={
                swapLoading
                  ? isNeedToApprove
                    ? "Aprroving"
                    : "Finding best rates..."
                  : "Amount receive"
              }
              onBlur={handleBlur}
            />
          </div>

          <Button
            className="w-100"
            disabled={
              isPreError ||
              (!isNeedToApprove && swapError?.length > 0) ||
              swapLoading ||
              !tokenAmountIn
            }
            onClick={sendSwapTx}
          >
            {swapLoading
              ? "Loading..."
              : isNeedToApprove
              ? "Approve and Swap"
              : swapError || "Swap"}
          </Button>
          {swapResultWithType?.routes && !isPreError && swapError === "" ? (
            <div>
              <Cell
                subtitle="Estimate time:"
                after={`~${swapResultWithType?.estimatedTime}s`}
              ></Cell>
              <Cell
                subtitle="Estimate gas:"
                after={`$${zerofy(
                  Number(
                    Number(swapResultWithType?.fee?.amount || 0) /
                      10 ** swapResultWithType?.fee?.decimals || 0
                  ) * tokenPrices[swapResultWithType?.fee?.symbol]
                )}`}
              ></Cell>
            </div>
          ) : (
            ""
          )}
        </List>
      </Section>
      <TokenSelectionModal
        setSelectVisible={setSelectVisible}
        isVisible={selectTokenVisible}
        setToken={(token: string) => {
          handleTokenChange(selectTokenFunction, token);
        }}
            />
    </Modal>
  );
};


export const TokenSelectionModal = ({ isVisible,setSelectVisible, setToken }: { 
  isVisible: boolean; 
  setSelectVisible: any;
  setToken: (token: string) => void; 
}) => {
  
  const tokenList = useMemo(() => Object.keys(WHITELIST_TOKEN), []);
  
  return (
    <Modal open={isVisible} trigger={undefined} onOpenChange={setSelectVisible}>
        <List>
          {tokenList.map((token) => (
            <Cell
              key={token}
              onClick={() => {
                setToken(token);
                setSelectVisible(false);
              }}
              before={
                <Iconify
                  icon={`token-branded:${token.toLowerCase()}`}
                  style={{ fontSize: "1.5rem" }}
                />
              }
            >
              {token}
            </Cell>
          ))}
        </List>
    </Modal>
  );
};


export const swapModal = async (visible: boolean) => {
  _modal({ visible });
};
