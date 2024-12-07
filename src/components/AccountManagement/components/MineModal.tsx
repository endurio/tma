import {
  Button,
  Cell,
  Divider,
  Input,
  List,
  Modal,
  Section,
} from "@telegram-apps/telegram-ui";
import { useEffect, useMemo, useState } from "react";
import { BTC_FEE, useBitcoinNetwork } from "@/hook/useBitcoinNetwork";
import { useWeb3Account } from "../hook/useWeb3Account";
import "@/pages/IndexPage/IndexPage.css";
import "./index.css";
import { Psbt } from "bitcoinjs-lib";
import { shortenAddress, weibtc, zerofy } from "@/utils/utils";
import { Iconify } from "@/components/iconify";
import { FONT_SIZE_SM } from "@/utils/constant";
import {useTokensPrice} from "@/hook/useTokensPrice";

let _modal: (props: { visible: boolean }) => void;

export const MineModal = () => {
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [opReturn, setOpReturn] = useState<string>("endur.io");
  const [maxBounty, setMaxBounty] = useState<string>("1");
  const [maxBountyError, setMaxBountyError] = useState<string>("");
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const {tokenPrices} = useTokensPrice()

  const { account } = useWeb3Account();
  const {
    mineTransaction,
    loading: mineLoading,
    error: mineError,
  } = useBitcoinNetwork({ web3Account: account });

  useEffect(() => {
    _modal = ({ visible }: { visible: boolean }) => {
      setVisible(visible);
    };
  }, []);

  const handleMaxBountyChange = (value: string) => {
    setMaxBounty(value);
    if (/^\d+$/.test(value) || value === "") {
      setMaxBountyError("");
    } else {
      setMaxBountyError("Max Bounty must be an integer.");
    }
  };

  const handleEstimate = async () => {
    if (!maxBounty || isNaN(Number(maxBounty)) || Number(maxBounty) < 1) {
      setMaxBountyError("Max Bounty must be a positive integer.");
      return;
    }
    const result = await mineTransaction({
      maxBounty: Number(maxBounty),
      opReturn,
      isEstimateOnly: true,
    });
    if (result) {
      setTransactionDetails(result);
      setConfirmVisible(true);
    }
  };

  const handleMine = async () => {
    setConfirmVisible(false);
    const result = await mineTransaction({
      maxBounty: Number(maxBounty),
      opReturn,
      isEstimateOnly: false,
    });
    if (!result) {
      // Handle error if necessary
    }
  };
  const bitcoinTxPsbt = useMemo(() => {
    return transactionDetails?.psbt as Psbt;
  }, [transactionDetails]);

  // Calculate fees and total spent
  const feeEstimate = useMemo(() => {
    if (!bitcoinTxPsbt) return 0;
    // const totalInput = bitcoinTxPsbt.txInputs.reduce(
    //   (acc, input) => acc + (input. || 0),
    //   0
    // );
    const totalOutput = bitcoinTxPsbt.txOutputs.reduce(
      (acc, output) => acc + (Number(output.value) || 0),
      0
    );
    return 0;
  }, [bitcoinTxPsbt]);

  const totalSpent = useMemo(() => {
    if (!bitcoinTxPsbt) return 0;
    return bitcoinTxPsbt.txOutputs.reduce(
      (acc, output) => acc + (Number(output.value) || 0),
      0
    );
  }, [bitcoinTxPsbt]);
  
  return (
    <>
      <Modal open={visible} onOpenChange={setVisible}>
        <Section>
          <List>
            <Cell
              title="Max Bounty"
              description="Set the maximum bounty for mining."
            />
            <Input
              className="w-100"
              value={maxBounty}
              onChange={(e) => handleMaxBountyChange(e.target.value)}
              placeholder="Enter max bounty..."
              type="text"
            />
            <Cell title="OP_RETURN" description="Custom data for OP_RETURN." />
            <Input
              className="w-100"
              value={opReturn}
              onChange={(e) => setOpReturn(e.target.value)}
              placeholder="Enter OP_RETURN data..."
            />
            <Button
              className="w-100"
              disabled={
                mineLoading || maxBountyError !== "" || mineError !== ""
              }
              onClick={handleEstimate}
              // style={
              //   maxBountyError || mineError
              //     ? { backgroundColor: "red", color: "white" }
              //     : {}
              // }
            >
              {mineLoading
                ? "Processing..."
                : maxBountyError
                ? maxBountyError
                : mineError
                ? mineError
                : "Mine"}
            </Button>
          </List>
        </Section>
      </Modal>

      <Modal open={confirmVisible} onOpenChange={setConfirmVisible}>
        <Section>
          <List>
            {bitcoinTxPsbt?.txInputs?.map((_input, index: number) => (
              <Cell
                key={index}
                before={
                  <Iconify
                    icon="mingcute:wallet-line"
                    width={FONT_SIZE_SM}
                    height={FONT_SIZE_SM}
                  />
                }
                subtitle={`${shortenAddress(account?.btcAddress)}`}
              />
            ))}
            <Divider />
            {bitcoinTxPsbt?.txOutputs?.map((output, index: number) => {
              if (!output?.value || !output?.address) return;
              // const label =
              //   index !== bitcoinTxPsbt?.txOutputs.length - 1
              //     ? "(Bounty)"
              //     : "(Cash Back)";
              return (
                <Cell
                  key={index}
                  title={`Output ${index + 1}`}
                  before={
                    <Iconify
                      icon="ph:sign-out-bold"
                      width={FONT_SIZE_SM}
                      height={FONT_SIZE_SM}
                    />
                  }
                  description={`${zerofy(
                    Number(weibtc(output.value))
                  )} BTC ($${zerofy(Number(weibtc(output.value)) * tokenPrices.BTC)}) => ${shortenAddress(output.address)}`}
                />
              );
            })}
            <Cell title="OP_RETURN" description={`OP_RETURN: ${opReturn}`} />
            <Divider />
            <Cell
              before={
                <Iconify
                  icon="ph:gas-pump-bold"
                  width={FONT_SIZE_SM}
                  height={FONT_SIZE_SM}
                />
              }
              description={`Fee: ${zerofy(
                Number(weibtc(BTC_FEE))
              )} BTC ($${zerofy(Number(weibtc(BTC_FEE)) * tokenPrices.BTC)})`}
            />
            <Cell
              before={
                <Iconify
                  icon="mdi:bitcoin"
                  width={FONT_SIZE_SM}
                  height={FONT_SIZE_SM}
                />
              }
              description={`Total Spent: ${zerofy(Number(weibtc(totalSpent)))} BTC ($${zerofy(Number(weibtc(totalSpent)) * tokenPrices.BTC)})`}
            />
            <Button className="w-100" onClick={handleMine}>
              Confirm and Mine
            </Button>
          </List>
        </Section>
      </Modal>
    </>
  );
};

export const mineModal = async (visible: boolean) => {
  _modal({ visible });
};
