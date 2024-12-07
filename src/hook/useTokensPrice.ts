import {useAppContext} from "@/pages/IndexPage/IndexPage";
import {WHITELIST_FETCH_PRICES_TOKEN_GECKO,WHITELIST_FETCH_PRICES_TOKEN_GECKO_NETWORK} from "@/utils/constant";
import axios from "axios";
import {useEffect} from "react";

export const useTokensPrice = () => {
    const { setTokenPrices, tokenPrices } = useAppContext();
    const fetchWhitelistTokenPrices = async () => {
        const fetchParams = Object.values(WHITELIST_FETCH_PRICES_TOKEN_GECKO).join(',')
        const results = (await axios.get(`https://api.geckoterminal.com/api/v2/simple/networks/${WHITELIST_FETCH_PRICES_TOKEN_GECKO_NETWORK}/token_price/${fetchParams}`))
        const fetchTokensPrice = results?.data?.data?.attributes?.token_prices
        const _tokenPrices = tokenPrices
        Object.entries(WHITELIST_FETCH_PRICES_TOKEN_GECKO).map(([symbol, address])=>{
            if(Object.keys(fetchTokensPrice).includes(address)){
                _tokenPrices[symbol] = Number(fetchTokensPrice[address])
            }
        })
        if(setTokenPrices) setTokenPrices(_tokenPrices)
        console.log(_tokenPrices)
    }
    return {fetchWhitelistTokenPrices, tokenPrices}
};
export const useInitTokensPrice = () => {
  const {fetchWhitelistTokenPrices} = useTokensPrice()
  useEffect(() => {
    fetchWhitelistTokenPrices()
  },[]);
};

