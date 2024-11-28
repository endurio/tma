import {
  ButtonCell,
  Card,
  Cell,
  Text,
  List,
  Section,
} from "@telegram-apps/telegram-ui";
import { useContext, useEffect, type FC } from "react";

import { Page } from "@/components/Page.tsx";
import { useWeb3Account } from "./hook/useWeb3Account";
import { AppContext } from "@/pages/IndexPage/IndexPage";
import { shortenAddress } from "@/utils/utils";

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
        </Section>
      </List>
    </Page>
  );
};
