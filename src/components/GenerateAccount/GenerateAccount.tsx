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
      </List>
    </Page>
  );
};
