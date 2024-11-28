import { ButtonCell, Cell, List, Section } from "@telegram-apps/telegram-ui";
import { useEffect, type FC } from "react";

import { Page } from "@/components/Page.tsx";
import { useWeb3Account } from "./hook/useWeb3Account";

export const GenerateAccount: FC = () => {
  const { generateWeb3Account } = useWeb3Account();
  useEffect(() => {
    console.log(generateWeb3Account());
  }, []);
  return (
    <Page back={false}>
      <List>
        <Section header="Generate Accounts"
          footer="Endurio.io">
          <ButtonCell before="[ARB & BTC]">Generate Account</ButtonCell>
          <Cell>

          </Cell>
        </Section>

      </List>
    </Page>
  );
};


