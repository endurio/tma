import {
  Button,
  Cell,
  Divider,
  List,
  Section,
} from "@telegram-apps/telegram-ui";
import { type FC } from "react";

import { Page } from "@/components/Page.tsx";
import { useAppContext } from "@/pages/IndexPage/IndexPage";
import { copyToClipboard, shortenAddress } from "@/utils/utils";
// import {Iconify} from "../iconify";
import "@/pages/IndexPage/IndexPage.css";
import { WHITELIST_TOKEN } from "@/utils/constant";
import { Iconify } from "../iconify";
import { depositModal } from "./components/DepositModal";
import { withdrawModal } from "./components/WithdrawModal";
import { useWeb3Account } from "./hook/useWeb3Account";
export const AccountManagement: FC = () => {
  const { setWeb3Account, web3Account, isFetchingWeb3Account } =
    useAppContext();
  const { fetchWeb3AccountState } = useWeb3Account();
  return (
    <Page back={false}>
      <List>
        <Section header="Accounts" footer="endur.io">
          {/* <ButtonCell before="[ARB & BTC]">Generate Account</BuxttonCell> */}
          <Cell>
            <List>
              <div>
                <Button
                  style={{ width: "100vw" }}
                  onClick={() => copyToClipboard(web3Account?.evmAddress || "")}
                  before={<Iconify icon="token:arbi" />}
                  disabled={isFetchingWeb3Account}
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
                  disabled={isFetchingWeb3Account}
                  after={
                    <Iconify icon={"material-symbols:content-copy-outline"} />
                  }
                >
                  {shortenAddress(web3Account?.btcAddress)}
                </Button>
              </div>
              <Divider />
              {Object.keys(WHITELIST_TOKEN).map((symbol, _: number) => {
                return (
                  <div key={_}>
                    {symbol}:{" "}
                    {(
                      Number(
                        web3Account?.balances?.[
                          WHITELIST_TOKEN[symbol]?.address
                        ]
                      ) /
                        10 ** WHITELIST_TOKEN[symbol].decimals || "0"
                    ).toString?.()}
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
              disabled={isFetchingWeb3Account}
              className="w-100"
            >
              Deposit
            </Button>
            {/* <Button
              onClick={() => {
                withdrawModal(true);
              }}
              before={<Iconify icon="material-symbols:upload" />}
              disabled={isFetchingWeb3Account}
              className="w-50"
            >
              Withdraw
            </Button> */}
            <Button
              onClick={async () => {
                await fetchWeb3AccountState();
              }}
              loading={isFetchingWeb3Account}
              style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}
              before={<Iconify icon="tabler:reload" />}
              className="w-100"
            >
              Reload
            </Button>
          </div>
        </Section>
      </List>
    </Page>
  );
};
