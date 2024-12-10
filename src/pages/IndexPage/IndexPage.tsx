import {Page} from "@/components/Page.tsx";
import {List} from "@telegram-apps/telegram-ui";
import {createContext,useContext,useState,type FC} from "react";

import {AccountManagement} from "@/components/AccountManagement/AccountManagement";
import {ITokensPrice, IWeb3Account} from "@/type";
import {InitComponent} from "./InitComponent";
import {DepositModal} from "@/components/AccountManagement/components/DepositModal";
import {WithdrawModal} from "@/components/AccountManagement/components/WithdrawModal";
import {SwapModal} from "@/components/AccountManagement/components/SwapModal";
import {MineModal} from "@/components/AccountManagement/components/MineModal";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface AppContextType {
  web3Account?: IWeb3Account;
  setWeb3Account?: React.Dispatch<
    React.SetStateAction<IWeb3Account | undefined>
  >;
  isFetchingWeb3Account: boolean
  setIsFetchingWeb3Account?: React.Dispatch<React.SetStateAction<boolean>>
  tokenPrices: ITokensPrice,
  setTokenPrices?: React.Dispatch<React.SetStateAction<ITokensPrice>>

}

export const AppContext = createContext<AppContextType>({
  web3Account: undefined,
  setWeb3Account: undefined,
  isFetchingWeb3Account: true,
  setIsFetchingWeb3Account: undefined,
  setTokenPrices: undefined,
  tokenPrices: {}
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
  const [tokenPrices, setTokenPrices] = useState<ITokensPrice>({});


  return (
    <AppContext.Provider value={{tokenPrices, setTokenPrices, web3Account, setWeb3Account, setIsFetchingWeb3Account, isFetchingWeb3Account }}>
      <InitComponent/>
      <DepositModal/>
      <SwapModal/>
      <MineModal/>
      <WithdrawModal/>
      <ToastContainer />

      <Page back={false}>
        <List>
          <AccountManagement />
        </List>
      </Page>
    </AppContext.Provider>
  );
};

