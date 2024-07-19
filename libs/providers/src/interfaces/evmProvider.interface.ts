import {
    Abi,
    Address,
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionReturnType,
    Hex,
} from "viem";

/**
 * Represents the interface for an Ethereum Virtual Machine (EVM) provider.
 */
export interface IEvmProvider {
    /**
     * Retrieves the balance of the specified address.
     * @param {Address} address The address for which to retrieve the balance.
     * @returns {Promise<bigint>} A Promise that resolves to the balance of the address.
     */
    getBalance(address: Address): Promise<bigint>;

    /**
     * Retrieves the current block number.
     * @returns {Promise<bigint>} A Promise that resolves to the latest block number.
     */
    getBlockNumber(): Promise<bigint>;

    /**
     * Retrieves the current estimated gas price on the chain.
     * @returns {Promise<bigint>} A Promise that resolves to the current gas price.
     */
    getGasPrice(): Promise<bigint>;

    /**
     * Retrieves the value from a storage slot at a given address.
     * @param {Address} address The address of the contract.
     * @param {number} slot The slot number to read.
     * @returns {Promise<Hex>} A Promise that resolves to the value of the storage slot.
     */
    getStorageAt(address: Address, slot: number): Promise<Hex | undefined>;

    /**
     * Type safe way to read a contract's "view" | "pure" functions.
     * @param {Address} contractAddress The address of the contract.
     * @param {TAbi} abi The contract's ABI (Application Binary Interface).
     * @param {TFunctionName} functionName The name of the function to invoke.
     * @param {TArgs} args Optional arguments to pass to the function.
     * @returns A Promise that resolves to the return value of the contract function.
     */
    readContract<
        TAbi extends Abi,
        TFunctionName extends ContractFunctionName<TAbi, "pure" | "view"> = ContractFunctionName<
            TAbi,
            "pure" | "view"
        >,
        TArgs extends ContractFunctionArgs<
            TAbi,
            "pure" | "view",
            TFunctionName
        > = ContractFunctionArgs<TAbi, "pure" | "view", TFunctionName>,
    >(
        contractAddress: Address,
        abi: TAbi,
        functionName: TFunctionName,
        args?: TArgs,
    ): Promise<ContractFunctionReturnType<TAbi, "pure" | "view", TFunctionName, TArgs>>;
}
