import { isNativeError } from "util/types";
import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import {
    encodeFunctionData,
    erc20Abi,
    formatGwei,
    formatUnits,
    parseEther,
    zeroAddress,
} from "viem";

import { L1ProviderException } from "@zkchainhub/metrics/exceptions/provider.exception";
import { bridgeHubAbi, sharedBridgeAbi } from "@zkchainhub/metrics/l1/abis";
import { GasInfo } from "@zkchainhub/metrics/types";
import { IPricingService, PRICING_PROVIDER } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { AbiWithAddress, ChainId, L1_CONTRACTS, vitalikAddress } from "@zkchainhub/shared";
import { ETH, WETH } from "@zkchainhub/shared/tokens/tokens";

const ONE_ETHER = parseEther("1");
const ETHER_DECIMALS = 18;

/**
 * Acts as a wrapper around Viem library to provide methods to interact with an EVM-based blockchain.
 */
@Injectable()
export class L1MetricsService {
    private readonly bridgeHub: Readonly<AbiWithAddress> = {
        abi: bridgeHubAbi,
        address: L1_CONTRACTS.BRIDGE_HUB,
    };
    private readonly sharedBridge: Readonly<AbiWithAddress> = {
        abi: sharedBridgeAbi,
        address: L1_CONTRACTS.SHARED_BRIDGE,
    };
    private readonly diamondContracts: Map<ChainId, AbiWithAddress> = new Map();

    constructor(
        private readonly evmProviderService: EvmProviderService,
        @Inject(PRICING_PROVIDER) private readonly pricingService: IPricingService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    //TODO: Implement l1Tvl.
    async l1Tvl(): Promise<{ [asset: string]: { amount: number; amountUsd: number } }> {
        return { ETH: { amount: 1000000, amountUsd: 1000000 } };
    }
    //TODO: Implement getBatchesInfo.
    async getBatchesInfo(
        _chainId: number,
    ): Promise<{ commited: number; verified: number; proved: number }> {
        return { commited: 100, verified: 100, proved: 100 };
    }
    //TODO: Implement tvl.
    async tvl(
        _chainId: number,
    ): Promise<{ [asset: string]: { amount: number; amountUsd: number } }> {
        return { ETH: { amount: 1000000, amountUsd: 1000000 } };
    }
    //TODO: Implement chainType.
    async chainType(_chainId: number): Promise<"validium" | "rollup"> {
        return "rollup";
    }

    /**
     * Retrieves gas information for Ethereum transfers and ERC20 token transfers.
     * @returns {GasInfo} A promise that resolves to an object containing gas-related information.
     */
    async ethGasInfo(): Promise<GasInfo> {
        try {
            const [ethTransferGasCost, erc20TransferGasCost, gasPrice] = await Promise.all([
                // Estimate gas for an ETH transfer.
                this.evmProviderService.estimateGas({
                    account: vitalikAddress,
                    to: zeroAddress,
                    value: ONE_ETHER,
                }),
                // Estimate gas for an ERC20 transfer.
                this.evmProviderService.estimateGas({
                    account: vitalikAddress,
                    to: WETH.contractAddress,
                    data: encodeFunctionData({
                        abi: erc20Abi,
                        functionName: "transfer",
                        args: [L1_CONTRACTS.SHARED_BRIDGE, ONE_ETHER],
                    }),
                }),
                // Get the current gas price.
                this.evmProviderService.getGasPrice(),
            ]);

            // Get the current price of ether.
            let ethPriceInUsd: number | undefined = undefined;
            try {
                const priceResult = await this.pricingService.getTokenPrices([ETH.coingeckoId]);
                ethPriceInUsd = priceResult[ETH.coingeckoId];
            } catch (e) {
                this.logger.error("Failed to get the price of ether.");
            }

            return {
                gasPriceInGwei: Number(formatGwei(gasPrice)),
                ethPrice: ethPriceInUsd,
                ethTransferGas: Number(ethTransferGasCost),
                erc20TransferGas: Number(erc20TransferGasCost),
            };
        } catch (e: unknown) {
            if (isNativeError(e)) {
                this.logger.error(`Failed to get gas information: ${e.message}`);
            }
            throw new L1ProviderException("Failed to get gas information from L1.");
        }
    }

    /**
     * Calculates the transaction value in USD based on the gas used, gas price, and ether price.
     * Formula: (txGas * gasPriceInWei/1e18) * etherPrice
     * @param txGas - The amount of gas used for the transaction.
     * @param gasPrice - The price of gas in wei.
     * @param etherPrice - The current price of ether in USD.
     * @returns The transaction value in USD.
     */
    private transactionInUsd(txGas: bigint, gasPriceInWei: bigint, etherPrice: number): number {
        return Number(formatUnits(txGas * gasPriceInWei, ETHER_DECIMALS)) * etherPrice;
    }

    //TODO: Implement feeParams.
    async feeParams(_chainId: number): Promise<{
        batchOverheadL1Gas: number;
        maxPubdataPerBatch: number;
        maxL2GasPerBatch: number;
        priorityTxMaxPubdata: number;
        minimalL2GasPrice: number;
    }> {
        return {
            batchOverheadL1Gas: 50000,
            maxPubdataPerBatch: 120000,
            maxL2GasPerBatch: 10000000,
            priorityTxMaxPubdata: 15000,
            minimalL2GasPrice: 10000000,
        };
    }
}
