import {
  Button,
  Cell,
  Chip,
  Input,
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
import { Token } from "symbiosis-js-sdk";
import "./index.css";
import { useWeb3Account } from "../hook/useWeb3Account";
let _modal: (props: { visible: boolean }) => void;

export const SwapModal = () => {
  const [visible, setVisible] = useState(true);
  const [tokenInAmount, setTokenInAmount] = useState<string>("");
  const [inputToken, setInputToken] = useState<string>("ETH");
  const [outputToken, setOutputToken] = useState<string>("USDC");
  const { performSwap, swapLoading, swapError, swapResult } = useSymbiosis();
  const { account } = useWeb3Account();

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
    if (!Number(tokenInAmount) || tokenInAmount === "" || tokenInAmount === "0")
      return true;
    if (!tokensConstructions) return true;
    return false;
  }, [tokenInAmount, tokensConstructions]);
  const handleBlur = () => {
    if (tokensConstructions && tokenInAmount) {
      const { tokenIn, tokenOut } = tokensConstructions;
      performSwap({
        tokenIn,
        tokenInAmount: String(tokenInAmount),
        tokenOut,
        estimateOnly: true,
      });
    }
  };

  const sendSwapTx = async () => {
    if (!tokensConstructions) return;
    const { tokenIn, tokenOut } = tokensConstructions;
    if (swapLoading === false && swapError === "")
      performSwap({ tokenIn, tokenInAmount: String(tokenInAmount), tokenOut });
  };
  useEffect(() => {
    _modal = ({ visible }: { visible: boolean }) => {
      setVisible(visible);
    };
  }, []);

  useEffect(() => {
    if (visible) window.scrollTo(0, 0);
  }, [visible]);

  return (
    <Modal open={visible} trigger={undefined} onOpenChange={setVisible}>
      <Section>
        <Chip
          style={{ background: "none", border: "none" }}
          after={
            <Select
              className="tab-dropdown-button"
              value={inputToken}
              before={
                <Iconify
                  icon={`token-branded:${inputToken.toLowerCase()}`}
                  height={ICONIFY_SIZE_MD}
                  width={ICONIFY_SIZE_MD}
                />
              }
              style={{ cursor: "pointer" }}
              onChange={(e) => {
                setInputToken(e.currentTarget.value);
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
            value={tokenInAmount}
            onChange={(e) => setTokenInAmount(e.target.value)}
            placeholder="Enter Amount"
            onBlur={handleBlur}
          />
        </Chip>
        <Chip
          style={{
            width: "100%",
            textAlign: "center",
            border: "none",
            background: "none",
          }}
        >
          <Iconify
            icon="material-symbols:swap-vert-rounded"
            width={ICONIFY_SIZE_LG}
            height={ICONIFY_SIZE_LG}
          />
        </Chip>
        <Chip
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
            //   value={tokenInAmount}
            //   onChange={(e) => setTokenInAmount(e.target.value)}
            placeholder="Enter Amount"
            onBlur={handleBlur}
          />
        </Chip>
        <Button
          className="w-100"
          disabled={
            isPreError || swapError?.length > 0 || swapLoading || !tokenInAmount
          }
          onClick={sendSwapTx}
        >
          {swapLoading ? "Loading..." : swapError || "Swap"}
        </Button>
      </Section>
    </Modal>
  );
};

export const swapModal = async (visible: boolean) => {
  _modal({ visible });
};
