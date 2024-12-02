import {
  Button,
  Cell,
  Divider,
  List,
  Section,
} from "@telegram-apps/telegram-ui";
import {useEffect, type FC} from "react";

import {Page} from "@/components/Page.tsx";
import {useAppContext} from "@/pages/IndexPage/IndexPage";
import {copyToClipboard,shortenAddress} from "@/utils/utils";
// import {Iconify} from "../iconify";
import {useSymbiosis} from "@/pages/useSymbiosis";
import "@/pages/IndexPage/IndexPage.css";
import {WHITELIST_TOKEN} from "@/utils/constant";
import {ChainId,Token} from "symbiosis-js-sdk";
import {Iconify} from "../iconify";
import {depositModal} from "./components/DepositModal";
import {useWeb3Account} from "./hook/useWeb3Account";
export const AccountManagement: FC = () => {
  const { setWeb3Account, web3Account, isFetchingWeb3Account } =
    useAppContext();
  const { fetchWeb3AccountState } = useWeb3Account();
  const {swapLoading, swapError, swapResult, performSwap} = useSymbiosis()
  const swap = async () => {
    const tokenIn = new Token({address: '', isNative: true, symbol: 'ETH', chainId: ChainId.ARBITRUM_MAINNET, decimals: 18})
    const tokenOut = new Token({address: '', symbol: 'BTC', chainId: ChainId.BTC_MAINNET, decimals: 18})
    await performSwap({tokenIn, tokenOut, tokenInAmount: '0.001', estimateOnly: false})
  }
  useEffect(() => {
    console.log('#res', swapError, swapResult)
  },[swapError, swapResult ])
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
              <div>
                <Button
                  style={{ width: "100vw" }}
                  onClick={() => copyToClipboard(web3Account?.btcPublicKey || "")}
                  before={<Iconify icon="token:bitcoin" />}
                  disabled={isFetchingWeb3Account}
                  after={
                    <Iconify icon={"material-symbols:content-copy-outline"} />
                  }
                >
                  {shortenAddress(web3Account?.btcPublicKey)}
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
              className="w-50"
            >
              Deposit
            </Button>
            <Button
              onClick={() => {
                swap()
              }}
              loading={swapLoading}
              before={<Iconify icon="material-symbols:swap-horiz-rounded" />}
              // after={
              //   <div>
              //     <Iconify icon={`token:arbi`} />
              //     <Iconify icon={`token:btc`} />
              // </div>
              // }
              disabled={isFetchingWeb3Account}
              className="w-50"
            >
              Swap (0.001 ETH)
            </Button>
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
          <Cell description={swapResult ? JSON.stringify(swapResult) : swapError}>Swap Status: </Cell>
        </Section>
      </List>
    </Page>
  );
};
