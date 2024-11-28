import {Page} from "@/components/Page.tsx";
import {List} from "@telegram-apps/telegram-ui";
import {createContext,useContext,useState,type FC} from "react";

import {GenerateAccount} from "@/components/GenerateAccount/GenerateAccount";
import {IWeb3Account} from "@/type";
import {InitComponent} from "./InitComponent";

interface AppContextType {
  web3Account?: IWeb3Account;
  setWeb3Account?: React.Dispatch<
    React.SetStateAction<IWeb3Account | undefined>
  >;
}

export const AppContext = createContext<AppContextType>({
  web3Account: undefined,
  setWeb3Account: undefined,
});
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const IndexPage: FC = () => {
  const [web3Account, setWeb3Account] = useState<IWeb3Account>();
  return (
    <AppContext.Provider value={{ web3Account, setWeb3Account }}>
      <InitComponent/>
      <Page back={false}>
        <List>
          <GenerateAccount />
        </List>
      </Page>
    </AppContext.Provider>
  );
};

