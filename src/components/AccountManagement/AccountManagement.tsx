import {
  Button,
  Cell,
  Divider,
  List,
  Section
} from "@telegram-apps/telegram-ui";
import {useContext,type FC} from "react";

import {Page} from "@/components/Page.tsx";
import {AppContext, useAppContext} from "@/pages/IndexPage/IndexPage";
import {shortenAddress} from "@/utils/utils";
// import {Iconify} from "../iconify";
import '@/pages/IndexPage/IndexPage.css';
import {Iconify} from "../iconify";
import {ButtonBase} from "@mui/material";
import {withdrawModal} from "./components/WithdrawModal";
import {depositModal} from "./components/DepositModal";
import {WHITELIST_TOKEN} from "@/utils/constant";
export const AccountManagement: FC = () => {
  const { setWeb3Account, web3Account } = useAppContext();
  return (
    <Page back={false}>
      <List>
        <Section header="Accounts" footer="endur.io">
          {/* <ButtonCell before="[ARB & BTC]">Generate Account</ButtonCell> */}
          <Cell>
            <List>
              <div>EVM: {shortenAddress(web3Account?.evmAddress)}</div>
              <Divider/>
              {Object.keys(WHITELIST_TOKEN).map((symbol) => {
                return <div>{symbol}: {web3Account?.balances?.[WHITELIST_TOKEN[symbol]?.address].toString?.()}</div>
              })}
              <Divider/>
              <div>BTC: {shortenAddress(web3Account?.btcAddress)}</div>
            </List>
          </Cell>
          <div>
            <Button onClick={() => {if(web3Account?.evmAddress) depositModal(true, web3Account?.evmAddress)}} before={<Iconify icon='material-symbols:download'/>} className='w-50'>Deposit</Button>
            <Button onClick={() => {withdrawModal(true)}} before={<Iconify icon='material-symbols:upload'/>} className='w-50'>Withdraw</Button>
          </div>

        </Section>
      </List>
    </Page>
  );
};
