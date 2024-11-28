import {Cell,Image,List,Section} from '@telegram-apps/telegram-ui';
import {useEffect, useMemo, type FC} from 'react';

import {Page} from '@/components/Page.tsx';
import {useWeb3Account} from './hook/useWeb3Account';


export const GenerateAccount: FC = () => {
    const {generateWeb3Account} = useWeb3Account()
    useEffect(() => {
        console.log(generateWeb3Account())
        // return {evmWallet, btcWallet}
    },[])
  return (
    <Page back={false}>
      <List>
        <Section
          header="Generate Accounts"
          footer="Endurio.io"
          >
            <Cell
              subtitle="Generate Wallet With ARB & BTC mainnet"
            >
                {/* {JSON.stringify(btcWallet)} */}
                {/* {JSON.stringify(evmWallet)} */}
                {/* Generate Account Component */}
            </Cell>
        </Section>
      </List>
    </Page>
  );
};
