import {JSONProvider} from "@/config";
import {multicall} from "./multicall";
import {MULTICALL_ADDRESS, WHITELIST_TOKEN} from "./constant";
import {CallReturnContext} from "ethereum-multicall";
import {BigNumber} from "ethers";
import {IWeb3OnChainState} from "@/type";

export const loadWeb3AccountData = async (
    accounts: string[],
    tokens: string[],
    allowTokens: string[][],
  ): Promise<{ [account:string]: IWeb3OnChainState }> => {
    const data: { [account:string]: IWeb3OnChainState } = {};
  
    await multicall(
      JSONProvider,
      [{
        reference: "getEthBalance",
        contractAddress: MULTICALL_ADDRESS,
        abi: [
          {
            name: "getEthBalance",
            type: "function",
            inputs: [{ name: "addr", type: "address" }],
            outputs: [{ name: "balance", type: "uint256" }],
            stateMutability: "view",
          },
        ],
        calls: accounts.map((account) => {
          return {
            reference: account,
            methodName: "getEthBalance",
            methodParameters: [account],
          };
        }),
        context: (callsReturnContext: CallReturnContext[]) => {
          for (const ret of callsReturnContext) {
            const balance = BigNumber.from(ret.returnValues[0].hex)
            data[ret.reference] = {
              balances: {
                [WHITELIST_TOKEN.ETH.address]: balance,
              },
              allowances: {},
            };
          }
        },
      },
      ...tokens.map(token => ({
        reference: "balanceOf-" + token,
        contractAddress: token,
        abi: [
          {
            name: "balanceOf",
            type: "function",
            inputs: [{ name: "addr", type: "address" }],
            outputs: [{ name: "balance", type: "uint256" }],
            stateMutability: "view",
          },
        ],
        calls: accounts.map((account) => {
          return {
            reference: account,
            methodName: "balanceOf",
            methodParameters: [account],
          };
        }),
        context: (callsReturnContext: CallReturnContext[]) => {
          for (const ret of callsReturnContext) {
            data[ret.reference].balances[token] = BigNumber.from(ret.returnValues[0].hex);
          }
        },
      })),
      ...allowTokens.map(([token, spender]) => ({
        reference: "allowance-" + token + spender,
        contractAddress: token,
        abi: [
          {
            name: "allowance",
            type: "function",
            inputs: [
              { name: "owner", type: "address" },
              { name: "spender", type: "address" },
            ],
            outputs: [{ name: "balance", type: "uint256" }],
            stateMutability: "view",
          },
        ],
        calls: accounts.map((account) => {
          return {
            reference: account,
            methodName: "allowance",
            methodParameters: [account, spender],
          };
        }),
        context: (callsReturnContext: CallReturnContext[]) => {
          for (const ret of callsReturnContext) {
            if (!data[ret.reference].allowances[token]) {
              data[ret.reference].allowances[token] = {}
            }
            data[ret.reference].allowances[token][spender] = BigNumber.from(ret.returnValues[0].hex);
          }
        },
      }))
      ],
    )
  
    return data;
  };