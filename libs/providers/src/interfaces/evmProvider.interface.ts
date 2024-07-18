/**
 * An **IEvmProvider** is a wrapper around an Ethereum Virtual Machine (EVM) provider.
 *
 * It allows for reading data from smart contracts on EVM-compatible networks.
 *
 * Its agnostic to the underlying provider, which could be ethers.js, web3.js, or any other library.
 */
export interface IEvmProvider {
    /**
     * Reads data from a smart contract on the Ethereum network by simulating a contract call.
     * @returns A promise that resolves to the raw result of the contract call.
     * @throws {ContractCallException} If there is an error while calling the contract.
     */
    readContract(contractAddress: string, calldata: string): Promise<string>;
}
