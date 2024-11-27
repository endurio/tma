import {Cell,Image,List,Section} from '@telegram-apps/telegram-ui';
import type {FC} from 'react';

import {Page} from '@/components/Page.tsx';


export const GenerateAccount: FC = () => {
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
