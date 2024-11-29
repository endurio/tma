import {
  ContractCallContext,
  Multicall,
} from "ethereum-multicall";
import {providers} from "ethers";

export const multicall = async(
  ethersProvider: providers.JsonRpcProvider,
  contexts: ContractCallContext[],
  tryAggregate: boolean = true,
): Promise<any[]> => {
  const callbacks: { [reference: string]: any } = {}
  for (const context of contexts) {
    if (callbacks[context.reference]) {
      throw new Error(`dupplicated reference: ${context.reference}`)
    }
    callbacks[context.reference] = context.context
    delete context.context
  }
  const multicall = new Multicall({ ethersProvider, tryAggregate });
  const { results } = await multicall.call(contexts);
  return Object.values(results).map(result => {
    const callback = callbacks[result.originalContractCallContext.reference]
    if (callback != null && typeof callback === 'function') {
      return callback(result.callsReturnContext)
    }
  })
}
