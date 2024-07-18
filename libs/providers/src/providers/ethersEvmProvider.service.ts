import { Injectable } from "@nestjs/common";
import { ContractCallException } from "@packages/providers/exceptions";
import { IEvmProvider } from "@packages/providers/interfaces";
import { isCallException, JsonRpcProvider, Provider } from "ethers";

/**
 * An **EthersEvmProviderService** is a wrapper of Ethers.js's **Provider** class.
 * It allows for reading data from smart contracts on EVM-compatible networks.
 */
@Injectable()
export class EthersEvmProviderService implements IEvmProvider {
    provider: Provider;

    /**
     * @param rpcUrl - The URL of the Ethereum JSON-RPC endpoint.
     * @param chainId - The chain ID of the Ethereum network. Defaults to 1 (mainnet).
     */
    constructor(
        rpcUrl: string,
        readonly chainId: number = 1,
    ) {
        this.provider = new JsonRpcProvider(rpcUrl, chainId);
    }

    /**
     * Reads data from a smart contract on the Ethereum Virtual Machine (EVM).
     *
     * @param contractAddress - The address of the smart contract.
     * @param calldata - The data to be sent to the smart contract.
     * @returns A promise that resolves to the result of the contract call.
     * @throws {ContractCallException} If there is an error while calling the contract.
     */
    async readContract(contractAddress: string, calldata: string): Promise<string> {
        try {
            const rawResult = await this.provider.call({
                to: contractAddress,
                data: calldata,
            });

            return rawResult;
        } catch (error: unknown) {
            let message = `Calldata: ${calldata}.`;
            if (isCallException(error)) {
                message += `Reason: ${error.reason}. Code: ${error.code}`;
                if (error.invocation) {
                    message += `Function: ${error.invocation.method} (${error.invocation.signature})`;
                }
            } else {
                message += `Error: ${error}`;
            }

            throw new ContractCallException(contractAddress, this.chainId, message);
        }
    }
}
