import { useAppContext } from "@/pages/IndexPage/IndexPage";
import {
  WHITELIST_FETCH_PRICES_TOKEN_GECKO,
  WHITELIST_FETCH_PRICES_TOKEN_GECKO_NETWORK,
} from "@/utils/constant";
import { axiosErrorEncode } from "@/utils/utils";
import axios from "axios";
import { useEffect, useState } from "react";

export const useTokensPrice = () => {
  const { setTokenPrices, tokenPrices } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWhitelistTokenPrices = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchParams = Object.values(
        WHITELIST_FETCH_PRICES_TOKEN_GECKO
      ).join(",");
      const results = await axios.get(
        `https://api.geckoterminal.com/api/v2/simple/networks/${WHITELIST_FETCH_PRICES_TOKEN_GECKO_NETWORK}/token_price/${fetchParams}`
      );

      const fetchTokensPrice =
        results?.data?.data?.attributes?.token_prices || {};
      const _tokenPrices = { ...tokenPrices };

      Object.entries(WHITELIST_FETCH_PRICES_TOKEN_GECKO).forEach(
        ([symbol, address]) => {
          if (Object.keys(fetchTokensPrice).includes(address)) {
            _tokenPrices[symbol] = Number(fetchTokensPrice[address]);
          }
        }
      );

      if (setTokenPrices) setTokenPrices(_tokenPrices);
    } catch (err) {
      console.error("Error fetching whitelist token prices:", err);

      setError(axiosErrorEncode(err));
    } finally {
      setLoading(false);
    }
  };

  return { fetchWhitelistTokenPrices, tokenPrices, setTokenPrices, loading, error };
};

export const useInitTokensPrice = () => {
  const { fetchWhitelistTokenPrices } = useTokensPrice();

  useEffect(() => {
    fetchWhitelistTokenPrices();
  }, [fetchWhitelistTokenPrices]);
};
