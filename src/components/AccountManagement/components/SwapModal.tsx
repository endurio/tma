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
import "./index.css";
  let _modal: (props: { visible: boolean }) => void;
  
  export const SwapModal = () => {
    const [visible, setVisible] = useState(false);
    const [header] = useState("Deposit");
    useEffect(() => {
      _modal = ({
        visible,
      }: {
        visible: boolean;
      }) => {
        setVisible(visible);
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
              onClick={() => copyToClipboard('abc')}
              before={
                <div>
                  {Object.keys(WHITELIST_TOKEN).map((symbol) => {
                    return <Iconify icon={`token:${symbol.toLowerCase()}`} />;
                  })}
                </div>
              }
              after={<Iconify icon={"material-symbols:content-copy-outline"} />}
            >
              {shortenAddress('abc')}
              
            </Button>
          </Cell>
          <Cell before={<Iconify icon={'token-branded:arbi'}/>} subtitle={`Arbitrum One | ${JSONProvider?._network?.chainId}`}>
              Deposit:
          </Cell>
          <div className="qr-address-wrap">
          </div>
        </Section>
      </Modal>
    );
  };
  
  export const swapModal = async (
    visible: boolean,
  ) => {
    _modal({ visible });
  };
  