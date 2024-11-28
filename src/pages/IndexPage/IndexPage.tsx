import { Page } from "@/components/Page.tsx";
import { init, postEvent } from "@telegram-apps/sdk";
import { List } from "@telegram-apps/telegram-ui";
import { createContext, useContext, useState, type FC } from "react";

import { GenerateAccount } from "@/components/GenerateAccount/GenerateAccount";
import { IWeb3Account } from "@/type";
import {useInitWeb3Account} from "@/components/GenerateAccount/hook/useWeb3Account";

init();
postEvent("web_app_setup_swipe_behavior", { allow_vertical_swipe: false });
interface AppContextType {
  web3Account: IWeb3Account | undefined;
  setWeb3Account: React.Dispatch<
    React.SetStateAction<IWeb3Account | undefined>
  >;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const IndexPage: FC = () => {
  const [web3Account, setWeb3Account] = useState<IWeb3Account>();
  useInitWeb3Account()
  return (
    <AppContext.Provider value={{ web3Account, setWeb3Account }}>
      <Page back={false}>
        <List>
          {/* <Section
          header="Features"
          footer="You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects"
        >
          <Link to="/ton-connect">
            <Cell
              before={<Image src={tonSvg} style={{ backgroundColor: '#007AFF' }}/>}
              subtitle="Connect your TON wallet"
            >
              TON Connect
            </Cell>
          </Link>
        </Section> */}
          <GenerateAccount />

          {/* <Section
          header="Application Launch Data"
          footer="Endurio.io"
        > */}
          {/* <Link to="/init-data">
            <Cell subtitle="User data, chat information, technical data">Init Data</Cell>
          </Link>
          <Link to="/launch-params">
            <Cell subtitle="Platform identifier, Mini Apps version, etc.">Launch Parameters</Cell>
          </Link>
          <Link to="/theme-params">
            <Cell subtitle="Telegram application palette information">Theme Parameters</Cell>
          </Link> */}
          {/* </Section> */}
        </List>
      </Page>
    </AppContext.Provider>
  );
};



export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
