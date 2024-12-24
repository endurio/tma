import { Iconify } from "@/components/iconify";
import { BTC_FEE } from "@/hook/useBitcoinNetwork";
import { useConfigs } from "@/hook/useConfigs";
import { useEndurioContract } from "@/hook/useEndurioContract";
import "@/pages/IndexPage/IndexPage.css";
import { IWeb3AccountUTXO } from "@/type";
import { FONT_SIZE_SM } from "@/utils/constant";
import {
  axiosErrorEncode,
  shortenAddress,
  weibtc,
  zerofy,
} from "@/utils/utils";
import {
  Button,
  Cell,
  Divider,
  List,
  Modal,
  Section,
  Skeleton,
  Spinner,
} from "@telegram-apps/telegram-ui";
import { useEffect, useMemo, useState } from "react";
import { useWeb3Account } from "../hook/useWeb3Account";
import "./index.css";
import { useTokensPrice } from "@/hook/useTokensPrice";
import { toast } from "react-toastify";

let _modal: (props: { visible: boolean }) => void;

export const RelayModal = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    _modal = ({ visible }: { visible: boolean }) => {
      setVisible(visible);
    };
  }, []);
  const { account } = useWeb3Account();
  const { configs } = useConfigs();
  const { performRelay , performMultiRelay, relayState} = useEndurioContract();
  const { tokenPrices } = useTokensPrice();

  useEffect(() => {
    console.log(relayState)
  },[relayState])
  const displayMineTxNeedToRelays = useMemo(() => {
    const _displayRelayTxs: IWeb3AccountUTXO[] = [];
    Object.keys(account?.mineTxs || {}).map((key) => {
      const mineTx = account?.mineTxs[key];
      if (!mineTx || mineTx?.isRelayed) return;
      _displayRelayTxs.push(mineTx);
    });
    return _displayRelayTxs;
  }, [account]);
  const allRelaysState = useMemo(() => {
    let loading = false
    let error = false

    Object.keys(relayState).map(keyS => {
      if(relayState[keyS].loading === true && loading === false) {
        loading = true
      }
    })
    Object.keys(relayState).map(keyS => {
      if(relayState[keyS].error !== '' && error === false) {
        error = true
      }
    })
    return {
      relaysError: error,
      relaysLoading: loading
    }
  },[relayState])
  return (
    <Modal open={visible} trigger={undefined} onOpenChange={setVisible}>
      {/* <Button onClick={() => {    performRelay()}}>Relay</Button> */}
      <Section>
        <List>
          <Cell
            before={
              <Iconify
                icon="mingcute:wallet-line"
                width={FONT_SIZE_SM}
                height={FONT_SIZE_SM}
              />
            }
            subtitle={`${shortenAddress(account?.evmAddress)}`}
          />
          <Divider />
          <Cell subtitle="Relay mine transactions" />
          {displayMineTxNeedToRelays?.map((mineTx, index: number) => (
            <Cell
              key={index}
              before={
                <Iconify
                  icon="ph:sign-out-bold"
                  width={FONT_SIZE_SM}
                  height={FONT_SIZE_SM}
                />
              }
              subtitle={`${shortenAddress(mineTx.txid, 12, 12)}`}
              description={relayState[mineTx?.txid]?.error || ''}
              after={relayState[mineTx?.txid]?.loading ? <Spinner size={'s'}/> :''}
            />
          ))}
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
          <Button
            className="w-100"
            loading={allRelaysState.relaysLoading}
            onClick={async () => {
              try {
                await performMultiRelay( displayMineTxNeedToRelays.map((t) => {return {txHash: t.txid, callStatic: true}}));
              } catch (error) {
                toast.error(axiosErrorEncode(error));
              }
            }}
          >
            {allRelaysState?.relaysLoading ? 'Loading...' : `Relay all (${displayMineTxNeedToRelays.length})`}
          </Button>
        </List>
      </Section>
    </Modal>
  );
};

export const relayModal = async (visible: boolean) => {
  _modal({ visible });
};
