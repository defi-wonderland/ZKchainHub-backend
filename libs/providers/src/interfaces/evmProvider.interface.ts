import { FeeParams } from "@packages/providers/interfaces/feeParams.interface";
import { Address } from "@packages/providers/types/evm.type";

export interface IEvmProvider {
    getGasPrice(): Promise<bigint | null>;
    getTvl(): Promise<bigint>;
    getChainType(diamondProxyAddress: Address): Promise<"Rollup" | "Validium">;
    getTotalBatchesCommitted(diamondProxyAddress: Address): Promise<bigint>;
    getTotalBatchesVerified(diamondProxyAddress: Address): Promise<bigint>;
    getTotalBatchesExecuted(diamondProxyAddress: Address): Promise<bigint>;
    getFeeParams(diamondProxyAddress: Address): Promise<FeeParams>;
}
