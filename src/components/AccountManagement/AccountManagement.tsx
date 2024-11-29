import {
  Button,
  Cell,
  Divider,
  List,
  Section,
} from "@telegram-apps/telegram-ui";
import { useContext, type FC } from "react";

import { Page } from "@/components/Page.tsx";
import { AppContext, useAppContext } from "@/pages/IndexPage/IndexPage";
import { copyToClipboard, shortenAddress } from "@/utils/utils";
// import {Iconify} from "../iconify";
import "@/pages/IndexPage/IndexPage.css";
import { Iconify } from "../iconify";
import { ButtonBase, Icon } from "@mui/material";
import { withdrawModal } from "./components/WithdrawModal";
import { depositModal } from "./components/DepositModal";
import { WHITELIST_TOKEN } from "@/utils/constant";
export const AccountManagement: FC = () => {
  const { setWeb3Account, web3Account } = useAppContext();
  return (
    <Page back={false}>
      <List>
        <Section header="Accounts" footer="endur.io">
          {/* <ButtonCell before="[ARB & BTC]">Generate Account</ButtonCell> */}
          <Cell>
            <List>
              <div>
                <Button
                  style={{ width: "100vw" }}
                  onClick={() => copyToClipboard(web3Account?.evmAddress || "")}
                  before={<Iconify icon="token:arbi" />}
                  after={
                    <Iconify icon={"material-symbols:content-copy-outline"} />
                  }
                >
                  {shortenAddress(web3Account?.evmAddress)}
                </Button>
              </div>
              <div>
                <Button
                  style={{ width: "100vw" }}
                  onClick={() => copyToClipboard(web3Account?.btcAddress || "")}
                  before={<Iconify icon="token:bitcoin" />}
                  after={
                    <Iconify icon={"material-symbols:content-copy-outline"} />
                  }
                >
                  {shortenAddress(web3Account?.btcAddress)}
                </Button>
              </div>
              <Divider />
              {Object.keys(WHITELIST_TOKEN).map((symbol) => {
                return (
                  <div>
                    {symbol}:{" "}
                    {web3Account?.balances?.[
                      WHITELIST_TOKEN[symbol]?.address
                    ].toString?.()}
                  </div>
                );
              })}
            </List>
          </Cell>
          <div>
            <Button
              onClick={() => {
                if (web3Account?.evmAddress)
                  depositModal(true, web3Account?.evmAddress);
              }}
              before={<Iconify icon="material-symbols:download" />}
              className="w-50"
            >
              Deposit
            </Button>
            <Button
              onClick={() => {
                withdrawModal(true);
              }}
              before={<Iconify icon="material-symbols:upload" />}
              className="w-50"
            >
              Withdraw
            </Button>
          </div>
        </Section>
      </List>
    </Page>
  );
};
