import {Cell,Image,List,Section} from '@telegram-apps/telegram-ui';
import type {FC} from 'react';

import {Page} from '@/components/Page.tsx';


export const GenerateAccount: FC = () => {
  return (
    <Page back={false}>
      <List>
        <Section
          header="Generate Accounts"
          footer="You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects"
        >
            <Cell
              subtitle="Generate Wallet With ARB & BTC mainnet"
            >
                {/* Generate Account Component */}
            </Cell>
        </Section>
        {/* <Section
          header="Application Launch Data"
          footer="These pages help developer to learn more about current launch information"
        > */}
        {/* Generate Account Component */}
        {/* </Section> */}
      </List>
    </Page>
  );
};
