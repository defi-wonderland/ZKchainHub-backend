import assert from "assert";
import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Address, ContractConstructorArgs, parseAbiParameters } from "viem";

import { bridgeHubAbi, sharedBridgeAbi } from "@zkchainhub/metrics/l1/abis";
import { tokenBalancesAbi } from "@zkchainhub/metrics/l1/abis/tokenBalances.abi";
import { tokenBalancesBytecode } from "@zkchainhub/metrics/l1/bytecode";
import { Tvl } from "@zkchainhub/metrics/types";
import { IPricingService, PRICING_PROVIDER } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { AbiWithAddress, ChainId, L1_CONTRACTS } from "@zkchainhub/shared";
import { tokens } from "@zkchainhub/shared/tokens/tokens";
import { parseUnits } from "@zkchainhub/shared/utils";

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

    /**
     * Retrieves the Total Value Locked by token on L1 Shared Bridge contract
     * @returns A Promise that resolves to an object representing the TVL.
     */
    async l1Tvl(): Promise<Tvl> {
        const addresses = tokens
            .filter((token) => !!token.contractAddress)
            .map((token) => token.contractAddress) as Address[];

        const balances = await this.fetchTokenBalances(addresses);
        const pricesRecord = await this.pricingService.getTokenPrices(
            tokens.map((token) => token.coingeckoId),
        );

        assert(balances.length === addresses.length + 1, "Invalid balances length");
        assert(Object.keys(pricesRecord).length === tokens.length, "Invalid prices length");

        return this.calculateTvl(balances, addresses, pricesRecord);
    }

    private calculateTvl(
        balances: bigint[],
        addresses: Address[],
        prices: Record<string, number>,
    ): Tvl {
        const tvl: Tvl = {};

        for (const token of tokens) {
            const balance =
                token.type === "native"
                    ? balances[addresses.length]
                    : balances[addresses.indexOf(token.contractAddress as Address)];

            assert(balance !== undefined, `Balance for ${token.symbol} not found`);

            const price = prices[token.coingeckoId] as number;
            const parsedBalance = parseUnits(balance, token.decimals);
            const tvlValue = parsedBalance * price;

            tvl[token.symbol] = {
                amount: parsedBalance,
                amountUsd: tvlValue,
                name: token.name,
                imageUrl: token.imageUrl,
            };
        }

        return tvl;
    }

    /**
     * Fetches the token balances of Shared Bridgefor the given addresses.
     * Note: The last balance in the returned array is the ETH balance.
     * @param addresses The addresses for which to fetch the token balances.
     * @returns A promise that resolves to an array of token balances as bigints.
     */
    private async fetchTokenBalances(addresses: Address[]): Promise<bigint[]> {
        const returnAbiParams = parseAbiParameters("uint256[]");
        const args: ContractConstructorArgs<typeof tokenBalancesAbi> = [
            L1_CONTRACTS.SHARED_BRIDGE,
            addresses,
        ];

        const [balances] = await this.evmProviderService.batchRequest(
            tokenBalancesAbi,
            tokenBalancesBytecode,
            args,
            returnAbiParams,
        );

        return balances as bigint[];
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
    //TODO: Implement ethGasInfo.
    async ethGasInfo(): Promise<{ gasPrice: number; ethTransfer: number; erc20Transfer: number }> {
        return { gasPrice: 50, ethTransfer: 21000, erc20Transfer: 65000 };
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
