import {
  Button,
  Cell,
  Modal,
  Section
} from "@telegram-apps/telegram-ui";
import {useEffect,useState} from "react";

import {Iconify} from "@/components/iconify";
import {JSONProvider} from "@/config";
import "@/pages/IndexPage/IndexPage.css";
import {WHITELIST_TOKEN} from "@/utils/constant";
import {copyToClipboard,shortenAddress} from "@/utils/utils";
import QRCode from "react-qr-code";
import "./index.css";
let _modal: (props: { visible: boolean; depositAddress?: string }) => void;

export const DepositModal = () => {
  const [visible, setVisible] = useState(false);
  const [header] = useState("Deposit");
  const [depositAddress, setDepositAddress] = useState("Are you sure?");
  useEffect(() => {
    _modal = ({
      visible,
      depositAddress,
    }: {
      visible: boolean;
      depositAddress?: string;
    }) => {
      setVisible(visible);
      if (depositAddress) setDepositAddress(depositAddress);
    };
  }, []);

  useEffect(() => {
    if (visible) window.scrollTo(0, 0);
  }, [visible]);

  return (
    <Modal open={visible} trigger={undefined} onOpenChange={setVisible}>
      <Section header={header}>
        <Cell>
          <Button
            style={{ width: "100vw" }}
            onClick={() => copyToClipboard(depositAddress)}
            before={
              <div>
                {Object.keys(WHITELIST_TOKEN).map((symbol) => {
                  if(symbol === 'BTC') return;
                  return <Iconify icon={`token:${symbol.toLowerCase()}`} />;
                })}
              </div>
            }
            after={<Iconify icon={"material-symbols:content-copy-outline"} />}
          >
            {shortenAddress(depositAddress)}
            
          </Button>
        </Cell>
        <Cell before={<Iconify icon={'token-branded:arbi'}/>} subtitle={`Arbitrum One | ${JSONProvider?._network?.chainId}`}>
            {/* Deposit: */}
        </Cell>
        <div className="qr-address-wrap">
         
          <QRCode
            size={256}
            className="qr-address"
            value={depositAddress}
            viewBox={`0 0 256 256`}
          />
        </div>
      </Section>
    </Modal>
  );
};

export const depositModal = async (
  visible: boolean,
  depositAddress: string
) => {
  _modal({ visible, depositAddress });
};
