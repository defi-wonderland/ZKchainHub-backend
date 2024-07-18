/**
 * Represents an exception that occurs when there is an error calling a contract on a specific chain.
 */
export class ContractCallException extends Error {
    /**
     * @param address - The address of the contract.
     * @param chainId - The ID of the chain.
     * @param errorMessage - The error message associated with the exception.
     */
    constructor(address: string, chainId: number, errorMessage: string) {
        super(`Error calling contract ${address} on chain ${chainId}. Message: ${errorMessage}`);
    }
}
