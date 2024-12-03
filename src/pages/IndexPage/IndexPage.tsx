import {Page} from "@/components/Page.tsx";
import {List} from "@telegram-apps/telegram-ui";
import {createContext,useContext,useState,type FC} from "react";

import {AccountManagement} from "@/components/AccountManagement/AccountManagement";
import {IWeb3Account} from "@/type";
import {InitComponent} from "./InitComponent";
import {DepositModal} from "@/components/AccountManagement/components/DepositModal";
import {WithdrawModal} from "@/components/AccountManagement/components/WithdrawModal";
import {SwapModal} from "@/components/AccountManagement/components/SwapModal";

interface AppContextType {
  web3Account?: IWeb3Account;
  setWeb3Account?: React.Dispatch<
    React.SetStateAction<IWeb3Account | undefined>
  >;
  isFetchingWeb3Account: boolean
  setIsFetchingWeb3Account?: React.Dispatch<React.SetStateAction<boolean>>
}

export const AppContext = createContext<AppContextType>({
  web3Account: undefined,
  setWeb3Account: undefined,
  isFetchingWeb3Account: true,
  setIsFetchingWeb3Account: undefined,
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
  const [isFetchingWeb3Account, setIsFetchingWeb3Account] = useState<boolean>(true);

  return (
    <AppContext.Provider value={{ web3Account, setWeb3Account, setIsFetchingWeb3Account, isFetchingWeb3Account }}>
      <InitComponent/>
      <DepositModal/>
      <SwapModal/>
      <WithdrawModal/>
      <Page back={false}>
        <List>
          <AccountManagement />
        </List>
      </Page>
    </AppContext.Provider>
  );
};

