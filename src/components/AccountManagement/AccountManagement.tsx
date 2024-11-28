import {
  Button,
  Cell,
  List,
  Section
} from "@telegram-apps/telegram-ui";
import {useContext,type FC} from "react";

import {Page} from "@/components/Page.tsx";
import {AppContext} from "@/pages/IndexPage/IndexPage";
import {shortenAddress} from "@/utils/utils";
// import {Iconify} from "../iconify";
import '@/pages/IndexPage/IndexPage.css';
import {Iconify} from "../iconify";
import {ButtonBase} from "@mui/material";
export const AccountManagement: FC = () => {
  const { setWeb3Account, web3Account } = useContext(AppContext);

  return (
    <Page back={false}>
      <List>
        <Section header="Accounts" footer="Endurio.io">
          {/* <ButtonCell before="[ARB & BTC]">Generate Account</ButtonCell> */}
          <Cell>
            <List>
              <div>EVM: {shortenAddress(web3Account?.evmAddress)}</div>
              <div>BTC: {shortenAddress(web3Account?.btcAddress)}</div>
            </List>
          </Cell>
          <div>
            <Button before={<Iconify icon='material-symbols:download'/>} className='w-50'>Deposit</Button>
            <Button before={<Iconify icon='material-symbols:upload'/>} className='w-50'>Withdraw</Button>
          </div>

        </Section>
      </List>
    </Page>
  );
};
