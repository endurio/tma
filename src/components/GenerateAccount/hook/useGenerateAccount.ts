import { useState } from "react";
import { randomBytes } from "crypto";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import btcFromSeed from "bip32";
import { ethers } from "ethers";

type Wallet = {
  address: string;
  privateKey: string;
};

type UseGenerateAccountResult = {
  btcWallet: Wallet | null;
  arbWallet: Wallet | null;
  generateAccounts: () => void;
  isLoading: boolean;
  error: string | null;
};

const useGenerateAccount = (): UseGenerateAccountResult => {
  const [btcWallet, setBtcWallet] = useState<Wallet | null>(null);
  const [arbWallet, setArbWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAccounts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mnemonic = generateMnemonic();

      const seed = mnemonicToSeedSync(mnemonic);
      const btcNode = btcFromSeed(seed);
      const btcChild = btcNode.derivePath("m/44'/0'/0'/0/0");
      const btcWallet = {
        address: btcChild.getAddress().toString(),
        privateKey: btcChild.toWIF(),
      };

      const wallet = ethers.Wallet.createRandom({ extraEntropy: randomBytes(32) });
      const arbWallet = {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };

      setBtcWallet(btcWallet);
      setArbWallet(arbWallet);
    } catch (err) {
      setError((err as Error).message || "Failed to generate accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  return { btcWallet, arbWallet, generateAccounts, isLoading, error };
};

export default useGenerateAccount;
