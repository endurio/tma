/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export declare namespace PoR {
  export type ParamClaimStruct = {
    memoHash: BytesLike;
    slot: BigNumberish;
    payer: string;
  };

  export type ParamClaimStructOutput = [string, BigNumber, string] & {
    memoHash: string;
    slot: BigNumber;
    payer: string;
  };

  export type ParamSubmitStruct = {
    pubkey: BytesLike;
    header: BytesLike;
    merkleIndex: BigNumberish;
    merkleProof: BytesLike;
    version: BigNumberish;
    locktime: BigNumberish;
    vin: BytesLike;
    vout: BytesLike;
    inputIndex: BigNumberish;
    memoLength: BigNumberish;
    pubkeyPos: BigNumberish;
  };

  export type ParamSubmitStructOutput = [
    string,
    string,
    number,
    string,
    number,
    number,
    string,
    string,
    number,
    number,
    number
  ] & {
    pubkey: string;
    header: string;
    merkleIndex: number;
    merkleProof: string;
    version: number;
    locktime: number;
    vin: string;
    vout: string;
    inputIndex: number;
    memoLength: number;
    pubkeyPos: number;
  };

  export type ParamOutpointStruct = {
    version: BigNumberish;
    locktime: BigNumberish;
    vin: BytesLike;
    vout: BytesLike;
    pkhPos: BigNumberish;
  };

  export type ParamOutpointStructOutput = [
    number,
    number,
    string,
    string,
    number
  ] & {
    version: number;
    locktime: number;
    vin: string;
    vout: string;
    pkhPos: number;
  };

  export type ParamBountyStruct = {
    header: BytesLike;
    merkleIndex: BigNumberish;
    merkleProof: BytesLike;
    version: BigNumberish;
    locktime: BigNumberish;
    vin: BytesLike;
    vout: BytesLike;
  };

  export type ParamBountyStructOutput = [
    string,
    number,
    string,
    number,
    number,
    string,
    string
  ] & {
    header: string;
    merkleIndex: number;
    merkleProof: string;
    version: number;
    locktime: number;
    vin: string;
    vout: string;
  };
}

export interface PoRInterface extends utils.Interface {
  functions: {
    "BASE_TARGET()": FunctionFragment;
    "BOUNTY_RATE()": FunctionFragment;
    "BOUNTY_TIME()": FunctionFragment;
    "MEMO_HASH()": FunctionFragment;
    "REWARD_START()": FunctionFragment;
    "SLOT()": FunctionFragment;
    "SUBMIT_TIME()": FunctionFragment;
    "TOKEN()": FunctionFragment;
    "UPGRADE_INTERFACE_VERSION()": FunctionFragment;
    "VAULT()": FunctionFragment;
    "acceptOwnership()": FunctionFragment;
    "endurioClaim((bytes32,uint256,address))": FunctionFragment;
    "endurioRelay((bytes,bytes,uint32,bytes,uint32,uint32,bytes,bytes,uint32,uint32,uint32),(uint32,uint32,bytes,bytes,uint32)[],(bytes,uint32,bytes,uint32,uint32,bytes,bytes)[])": FunctionFragment;
    "owner()": FunctionFragment;
    "pendingOwner()": FunctionFragment;
    "proxiableUUID()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "upgradeToAndCall(address,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "BASE_TARGET"
      | "BOUNTY_RATE"
      | "BOUNTY_TIME"
      | "MEMO_HASH"
      | "REWARD_START"
      | "SLOT"
      | "SUBMIT_TIME"
      | "TOKEN"
      | "UPGRADE_INTERFACE_VERSION"
      | "VAULT"
      | "acceptOwnership"
      | "endurioClaim"
      | "endurioRelay"
      | "owner"
      | "pendingOwner"
      | "proxiableUUID"
      | "renounceOwnership"
      | "transferOwnership"
      | "upgradeToAndCall"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "BASE_TARGET",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "BOUNTY_RATE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "BOUNTY_TIME",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "MEMO_HASH", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "REWARD_START",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "SLOT", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "SUBMIT_TIME",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "TOKEN", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "UPGRADE_INTERFACE_VERSION",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "VAULT", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "acceptOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "endurioClaim",
    values: [PoR.ParamClaimStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "endurioRelay",
    values: [
      PoR.ParamSubmitStruct,
      PoR.ParamOutpointStruct[],
      PoR.ParamBountyStruct[]
    ]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "proxiableUUID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [string, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "BASE_TARGET",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "BOUNTY_RATE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "BOUNTY_TIME",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "MEMO_HASH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "REWARD_START",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "SLOT", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "SUBMIT_TIME",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "TOKEN", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "UPGRADE_INTERFACE_VERSION",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "VAULT", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "acceptOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "endurioClaim",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "endurioRelay",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proxiableUUID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;

  events: {
    "EndurioClaim(address,bytes32,bytes32,uint256,uint256)": EventFragment;
    "EndurioRelay(address,bytes32,uint256,uint256)": EventFragment;
    "OwnershipTransferStarted(address,address)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "Upgraded(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "EndurioClaim"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "EndurioRelay"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferStarted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Upgraded"): EventFragment;
}

export interface EndurioClaimEventObject {
  miner: string;
  memoHash: string;
  payerHash: string;
  slot: BigNumber;
  amount: BigNumber;
}
export type EndurioClaimEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber],
  EndurioClaimEventObject
>;

export type EndurioClaimEventFilter = TypedEventFilter<EndurioClaimEvent>;

export interface EndurioRelayEventObject {
  miner: string;
  memoHash: string;
  slot: BigNumber;
  rewardRate: BigNumber;
}
export type EndurioRelayEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  EndurioRelayEventObject
>;

export type EndurioRelayEventFilter = TypedEventFilter<EndurioRelayEvent>;

export interface OwnershipTransferStartedEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferStartedEvent = TypedEvent<
  [string, string],
  OwnershipTransferStartedEventObject
>;

export type OwnershipTransferStartedEventFilter =
  TypedEventFilter<OwnershipTransferStartedEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface UpgradedEventObject {
  implementation: string;
}
export type UpgradedEvent = TypedEvent<[string], UpgradedEventObject>;

export type UpgradedEventFilter = TypedEventFilter<UpgradedEvent>;

export interface PoR extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PoRInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    BASE_TARGET(overrides?: CallOverrides): Promise<[BigNumber]>;

    BOUNTY_RATE(overrides?: CallOverrides): Promise<[BigNumber]>;

    BOUNTY_TIME(overrides?: CallOverrides): Promise<[BigNumber]>;

    MEMO_HASH(overrides?: CallOverrides): Promise<[string]>;

    REWARD_START(overrides?: CallOverrides): Promise<[BigNumber]>;

    SLOT(overrides?: CallOverrides): Promise<[BigNumber]>;

    SUBMIT_TIME(overrides?: CallOverrides): Promise<[BigNumber]>;

    TOKEN(overrides?: CallOverrides): Promise<[string]>;

    UPGRADE_INTERFACE_VERSION(overrides?: CallOverrides): Promise<[string]>;

    VAULT(overrides?: CallOverrides): Promise<[string]>;

    acceptOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    endurioClaim(
      params: PoR.ParamClaimStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    endurioRelay(
      params: PoR.ParamSubmitStruct,
      outpoint: PoR.ParamOutpointStruct[],
      bounty: PoR.ParamBountyStruct[],
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pendingOwner(overrides?: CallOverrides): Promise<[string]>;

    proxiableUUID(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  BASE_TARGET(overrides?: CallOverrides): Promise<BigNumber>;

  BOUNTY_RATE(overrides?: CallOverrides): Promise<BigNumber>;

  BOUNTY_TIME(overrides?: CallOverrides): Promise<BigNumber>;

  MEMO_HASH(overrides?: CallOverrides): Promise<string>;

  REWARD_START(overrides?: CallOverrides): Promise<BigNumber>;

  SLOT(overrides?: CallOverrides): Promise<BigNumber>;

  SUBMIT_TIME(overrides?: CallOverrides): Promise<BigNumber>;

  TOKEN(overrides?: CallOverrides): Promise<string>;

  UPGRADE_INTERFACE_VERSION(overrides?: CallOverrides): Promise<string>;

  VAULT(overrides?: CallOverrides): Promise<string>;

  acceptOwnership(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  endurioClaim(
    params: PoR.ParamClaimStruct,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  endurioRelay(
    params: PoR.ParamSubmitStruct,
    outpoint: PoR.ParamOutpointStruct[],
    bounty: PoR.ParamBountyStruct[],
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  pendingOwner(overrides?: CallOverrides): Promise<string>;

  proxiableUUID(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  upgradeToAndCall(
    newImplementation: string,
    data: BytesLike,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    BASE_TARGET(overrides?: CallOverrides): Promise<BigNumber>;

    BOUNTY_RATE(overrides?: CallOverrides): Promise<BigNumber>;

    BOUNTY_TIME(overrides?: CallOverrides): Promise<BigNumber>;

    MEMO_HASH(overrides?: CallOverrides): Promise<string>;

    REWARD_START(overrides?: CallOverrides): Promise<BigNumber>;

    SLOT(overrides?: CallOverrides): Promise<BigNumber>;

    SUBMIT_TIME(overrides?: CallOverrides): Promise<BigNumber>;

    TOKEN(overrides?: CallOverrides): Promise<string>;

    UPGRADE_INTERFACE_VERSION(overrides?: CallOverrides): Promise<string>;

    VAULT(overrides?: CallOverrides): Promise<string>;

    acceptOwnership(overrides?: CallOverrides): Promise<void>;

    endurioClaim(
      params: PoR.ParamClaimStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    endurioRelay(
      params: PoR.ParamSubmitStruct,
      outpoint: PoR.ParamOutpointStruct[],
      bounty: PoR.ParamBountyStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;

    pendingOwner(overrides?: CallOverrides): Promise<string>;

    proxiableUUID(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "EndurioClaim(address,bytes32,bytes32,uint256,uint256)"(
      miner?: string | null,
      memoHash?: BytesLike | null,
      payerHash?: BytesLike | null,
      slot?: null,
      amount?: null
    ): EndurioClaimEventFilter;
    EndurioClaim(
      miner?: string | null,
      memoHash?: BytesLike | null,
      payerHash?: BytesLike | null,
      slot?: null,
      amount?: null
    ): EndurioClaimEventFilter;

    "EndurioRelay(address,bytes32,uint256,uint256)"(
      miner?: string | null,
      memoHash?: BytesLike | null,
      slot?: null,
      rewardRate?: null
    ): EndurioRelayEventFilter;
    EndurioRelay(
      miner?: string | null,
      memoHash?: BytesLike | null,
      slot?: null,
      rewardRate?: null
    ): EndurioRelayEventFilter;

    "OwnershipTransferStarted(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferStartedEventFilter;
    OwnershipTransferStarted(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferStartedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;

    "Upgraded(address)"(implementation?: string | null): UpgradedEventFilter;
    Upgraded(implementation?: string | null): UpgradedEventFilter;
  };

  estimateGas: {
    BASE_TARGET(overrides?: CallOverrides): Promise<BigNumber>;

    BOUNTY_RATE(overrides?: CallOverrides): Promise<BigNumber>;

    BOUNTY_TIME(overrides?: CallOverrides): Promise<BigNumber>;

    MEMO_HASH(overrides?: CallOverrides): Promise<BigNumber>;

    REWARD_START(overrides?: CallOverrides): Promise<BigNumber>;

    SLOT(overrides?: CallOverrides): Promise<BigNumber>;

    SUBMIT_TIME(overrides?: CallOverrides): Promise<BigNumber>;

    TOKEN(overrides?: CallOverrides): Promise<BigNumber>;

    UPGRADE_INTERFACE_VERSION(overrides?: CallOverrides): Promise<BigNumber>;

    VAULT(overrides?: CallOverrides): Promise<BigNumber>;

    acceptOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    endurioClaim(
      params: PoR.ParamClaimStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    endurioRelay(
      params: PoR.ParamSubmitStruct,
      outpoint: PoR.ParamOutpointStruct[],
      bounty: PoR.ParamBountyStruct[],
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pendingOwner(overrides?: CallOverrides): Promise<BigNumber>;

    proxiableUUID(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    BASE_TARGET(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    BOUNTY_RATE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    BOUNTY_TIME(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MEMO_HASH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    REWARD_START(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    SLOT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    SUBMIT_TIME(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    TOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    UPGRADE_INTERFACE_VERSION(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    VAULT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    acceptOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    endurioClaim(
      params: PoR.ParamClaimStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    endurioRelay(
      params: PoR.ParamSubmitStruct,
      outpoint: PoR.ParamOutpointStruct[],
      bounty: PoR.ParamBountyStruct[],
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pendingOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    proxiableUUID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}