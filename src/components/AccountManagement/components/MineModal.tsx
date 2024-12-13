import {Iconify} from "@/components/iconify";
import {BITCOIN_TESTNET_REQUEST, BTC_FEE,useBitcoinNetwork} from "@/hook/useBitcoinNetwork";
import {useTokensPrice} from "@/hook/useTokensPrice";
import "@/pages/IndexPage/IndexPage.css";
import {FONT_SIZE_SM} from "@/utils/constant";
import {shortenAddress,weibtc,zerofy} from "@/utils/utils";
import {
  Button,
  Cell,
  Divider,
  Input,
  List,
  Modal,
  Section,
} from "@telegram-apps/telegram-ui";
import {Psbt} from "bitcoinjs-lib";
import {useEffect,useMemo,useState} from "react";
import {useWeb3Account} from "../hook/useWeb3Account";
import "./index.css";
import {toast} from "react-toastify";
import {setCloudStorageItem} from "@telegram-apps/sdk";

let _modal: (props: { visible: boolean }) => void;

export const MineModal = () => {
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [opReturn, setOpReturn] = useState<string>("endur.io");
  const [maxBounty, setMaxBounty] = useState<string>("4");
  const [maxBountyError, setMaxBountyError] = useState<string>("");
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const {tokenPrices} = useTokensPrice()

  const { account,fetchWeb3AccountState } = useWeb3Account();
  const {
    mineTransaction,
    broadcastTransaction,
    loading: mineLoading,
    error: mineError,
    mineParams,
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
    if (result && mineError === '' && !mineLoading) {
      setTransactionDetails(result);
      setConfirmVisible(true);
    }
  };

  const handleMine = async () => {
    if(!mineParams.txHex && mineError === '' && mineLoading === false) return;
    setConfirmVisible(false);
    const txHash = await broadcastTransaction(mineParams.txHex);
    if (txHash) {
      setVisible(false)
      toast(
        <div>
          Transaction submitted successfully. View details on the {' '}
          <a 
            href={`https://mempool.space/${BITCOIN_TESTNET_REQUEST}tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: "#f0ad4e", textDecoration: "underline" }}
          >
            blockchain explorer
          </a>.
        </div>
      ,{type: 'success'});
      localStorage.setItem(`minetx-${txHash}`, JSON.stringify(mineParams.input))
      await fetchWeb3AccountState()
    }
    
  };
  const bitcoinTxPsbt = useMemo(() => {
    return transactionDetails?.psbt as Psbt;
  }, [transactionDetails]);

  const totalSpent = useMemo(() => {
    if (!bitcoinTxPsbt) return 0;
    return bitcoinTxPsbt.txOutputs.reduce(
      (acc, output) => acc + (Number(output.value) || 0),
      0
    ) - Number(bitcoinTxPsbt.txOutputs[bitcoinTxPsbt.txOutputs.length -1].value);
  }, [bitcoinTxPsbt]);
  // useEffect(() => {
  //   mineTransaction({
  //     maxBounty: Number(maxBounty),
  //     opReturn,
  //     isEstimateOnly: true,
  //   });
  // },[maxBounty, opReturn, account?.btcUTXOs])
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
                // : mineError
                // ? mineError
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
              const isChange = index === bitcoinTxPsbt?.txOutputs.length - 1;
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
                  )} BTC ($${zerofy(Number(weibtc(output.value)) * tokenPrices.BTC)}) => ${isChange ? " (Change)" : shortenAddress(output.address)}`}
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
