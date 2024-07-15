import { Injectable } from "@nestjs/common";
import { FeeParams, IEvmProvider } from "@packages/providers/interfaces";
import { Address } from "@packages/providers/types";
import { GettersFacet__factory } from "@shared/abis";
import { AbiCoder, JsonRpcProvider, Provider } from "ethers";

@Injectable()
export class EthersEvmProviderService implements IEvmProvider {
    private readonly FEE_PARAMS_SLOT =
        0x0000000000000000000000000000000000000000000000000000000000000026n;

    provider: Provider;
    abiCoder: AbiCoder;

    constructor(rpcUrl: string) {
        this.provider = new JsonRpcProvider(rpcUrl);
        this.abiCoder = AbiCoder.defaultAbiCoder();
    }
    async getGasPrice(): Promise<bigint | null> {
        const { gasPrice } = await this.provider.getFeeData();

        return gasPrice;
    }
    getTvl(): Promise<bigint> {
        throw new Error("Method not implemented.");
    }

    async getChainType(diamondProxyAddress: Address): Promise<"Rollup" | "Validium"> {
        const gettersFacet = GettersFacet__factory.connect(diamondProxyAddress, this.provider);
        const chainType = await gettersFacet.getPubdataPricingMode();

        return chainType === 0n ? "Rollup" : "Validium";
    }
    async getTotalBatchesCommitted(diamondProxyAddress: Address): Promise<bigint> {
        const gettersFacet = GettersFacet__factory.connect(diamondProxyAddress, this.provider);
        return gettersFacet.getTotalBatchesCommitted();
    }
    async getTotalBatchesVerified(diamondProxyAddress: Address): Promise<bigint> {
        const gettersFacet = GettersFacet__factory.connect(diamondProxyAddress, this.provider);
        return gettersFacet.getTotalBatchesVerified();
    }
    async getTotalBatchesExecuted(diamondProxyAddress: Address): Promise<bigint> {
        const gettersFacet = GettersFacet__factory.connect(diamondProxyAddress, this.provider);
        return gettersFacet.getTotalBatchesExecuted();
    }
    async getFeeParams(diamondProxyAddress: Address): Promise<FeeParams> {
        const feeParams = await this.provider.getStorage(diamondProxyAddress, this.FEE_PARAMS_SLOT);

        const decodedFeeParams = this.decodeResponseData(feeParams, [
            "uint8",
            "uint32",
            "uint32",
            "uint32",
            "uint32",
            "uint64",
        ]) as FeeParams;

        return decodedFeeParams;
    }

    private decodeResponseData(data: string, decodeTypes: string[]): unknown {
        const [decoded] = this.abiCoder.decode(decodeTypes, data);
        return decoded;
    }
}
