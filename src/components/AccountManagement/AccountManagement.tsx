import {
  Button,
  ButtonCell,
  Cell,
  Chip,
  Divider,
  List,
  Section,
  // Text,
} from "@telegram-apps/telegram-ui";
import {useEffect, type FC} from "react";

import {Page} from "@/components/Page.tsx";
import {useAppContext} from "@/pages/IndexPage/IndexPage";
import {copyToClipboard,openBitcoinExplorer,openEVVMExplorer,shortenAddress, zerofy} from "@/utils/utils";
// import {Iconify} from "../iconify";
import {useSymbiosis} from "@/hook/useSymbiosis";
import "@/pages/IndexPage/IndexPage.css";
import {ICONIFY_SIZE_MD, ICONIFY_SIZE_SM, WHITELIST_TOKEN} from "@/utils/constant";
import {ChainId,Token} from "symbiosis-js-sdk";
import {Iconify} from "../iconify";
import {depositModal} from "./components/DepositModal";
import {useWeb3Account} from "./hook/useWeb3Account";
import {swapModal} from "./components/SwapModal";

export const AccountManagement: FC = () => {
  const { setWeb3Account, web3Account, isFetchingWeb3Account } =
    useAppContext();
  const { fetchWeb3AccountState } = useWeb3Account();
  const {swapLoading, swapError, swapResult, performSwap} = useSymbiosis()
  const swap = async () => {
    const tokenIn = new Token({address: '', isNative: true, symbol: 'ETH', chainId: ChainId.ARBITRUM_MAINNET, decimals: 18})
    const tokenOut = new Token({address: '', symbol: 'BTC', chainId: ChainId.BTC_MAINNET, decimals: 18})
    await performSwap({tokenIn, tokenOut, tokenInAmount: '0.002', estimateOnly: false})
  }
  useEffect(() => {
    console.log('#res', swapError, swapResult)
  },[swapError, swapResult ])
  return (
    <Page back={false}>
      <List>
        <Section>
          {/* <ButtonCell before="[ARB & BTC]">Generate Account</BuxttonCell> */}
          <Cell>
            {/* <List> */}
              <div>
                <div>
                  <Chip
                    style={{ width: "100%", padding: 3, background: 'none' }}
                    before={<Iconify icon="token:arbi" height={ICONIFY_SIZE_SM} width={ICONIFY_SIZE_SM} />}
                    disabled={isFetchingWeb3Account}
                    after={<div>
                      <Iconify icon={"material-symbols:content-copy-outline"} onClick={() => copyToClipboard(web3Account?.evmAddress || "")} height={ICONIFY_SIZE_SM} width={ICONIFY_SIZE_SM}/> 
                      <Iconify icon={"cuida:open-in-new-tab-outline"} onClick={() => {openEVVMExplorer({address: web3Account?.evmAddress})}} height={ICONIFY_SIZE_SM} width={ICONIFY_SIZE_SM}/> 
                    </div>}
                  >
                    {shortenAddress(web3Account?.evmAddress)}
                  </Chip>
                </div>
                <div>
                <Chip
                    style={{ width: "100%",padding: 3, background: 'none' }}
                    onClick={() => copyToClipboard(web3Account?.btcAddress || "")}
                    before={<Iconify icon="token:btc" height={ICONIFY_SIZE_SM} width={ICONIFY_SIZE_SM} />}
                    disabled={isFetchingWeb3Account}
                    after={<div>
                     <Iconify icon={"material-symbols:content-copy-outline"} onClick={() => copyToClipboard(web3Account?.btcAddress || "")} height={ICONIFY_SIZE_SM} width={ICONIFY_SIZE_SM}/> 
                     <Iconify icon={"cuida:open-in-new-tab-outline"} onClick={() => {openBitcoinExplorer({address: web3Account?.btcAddress})}} height={ICONIFY_SIZE_SM} width={ICONIFY_SIZE_SM}/>
                      </div>} 
                  >
                    {shortenAddress(web3Account?.btcAddress)}
                  </Chip>
                </div>
              </div>
              <Divider style={{ width: "100vw", marginTop: '0.5rem', marginBottom: '0.5rem'}}/>
              <div>
              {Object.keys(WHITELIST_TOKEN).map((symbol, _: number) => {
                return (
                 <div style={{marginBottom: '0.5rem'}}>
                   <Chip style={{padding: 3, background: 'none'}} before={<div>
                    <Iconify icon={`token-branded:${symbol.toLowerCase()}`}/>
                   </div>}>{symbol}: {zerofy(
                        Number(
                          web3Account?.balances?.[
                            WHITELIST_TOKEN[symbol]?.address
                          ]
                        ) /
                          10 ** WHITELIST_TOKEN[symbol].decimals || 0
                      )}</Chip>
                 </div>
                );
              })}
                <Chip style={{padding: 4, background: 'none'}} before={<div>
                  <Iconify icon={`token-branded:btc`}/>
                  </div>
                  }>BTC: {zerofy(web3Account?.btcDisplayBalance || 0)}</Chip>
              </div>
            {/* </List> */}
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
                // swap()
                swapModal(true)
              }}
              loading={swapLoading}
              before={<Iconify icon="material-symbols:swap-horiz-rounded" />}
              disabled={isFetchingWeb3Account}
              className="w-50"
            >
              Swap
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
          {/* <Cell description={swapResult ? JSON.stringify(swapResult) : swapError}>Swap Status: </Cell> */}
        </Section>
      </List>
    </Page>
  );
};
