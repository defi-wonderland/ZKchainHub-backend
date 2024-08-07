import { createMock } from "@golevelup/ts-jest";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

import { L1MetricsService } from "@zkchainhub/metrics/l1/";
import { bridgeHubAbi, sharedBridgeAbi } from "@zkchainhub/metrics/l1/abis";
import { tokenBalancesAbi } from "@zkchainhub/metrics/l1/abis/tokenBalances.abi";
import { tokenBalancesBytecode } from "@zkchainhub/metrics/l1/bytecode";
import { IPricingService, PRICING_PROVIDER } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { ETH_TOKEN_ADDRESS, L1_CONTRACTS } from "@zkchainhub/shared";

// Mock implementations of the dependencies
const mockEvmProviderService = createMock<EvmProviderService>();

const mockPricingService = createMock<IPricingService>();

jest.mock("@zkchainhub/shared/tokens/tokens", () => ({
    ...jest.requireActual("@zkchainhub/shared/tokens/tokens"),
    get nativeToken() {
        return {
            name: "Ethereum",
            symbol: "ETH",
            contractAddress: null,
            coingeckoId: "ethereum",
            type: "native",
            imageUrl:
                "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
            decimals: 18,
        };
    },
    get erc20Tokens() {
        return [
            {
                name: "USDC",
                symbol: "USDC",
                contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                coingeckoId: "usd-coin",
                imageUrl:
                    "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                type: "erc20",
                decimals: 6,
            },
            {
                name: "Wrapped BTC",
                symbol: "WBTC",
                contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                coingeckoId: "wrapped-bitcoin",
                imageUrl:
                    "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
                type: "erc20",
                decimals: 8,
            },
        ];
    },
    get tokens() {
        return [
            {
                name: "Ethereum",
                symbol: "ETH",
                contractAddress: null,
                coingeckoId: "ethereum",
                type: "native",
                imageUrl:
                    "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                decimals: 18,
            },
            {
                name: "USDC",
                symbol: "USDC",
                contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                coingeckoId: "usd-coin",
                imageUrl:
                    "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                type: "erc20",
                decimals: 6,
            },
            {
                name: "Wrapped BTC",
                symbol: "WBTC",
                contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                coingeckoId: "wrapped-bitcoin",
                imageUrl:
                    "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
                type: "erc20",
                decimals: 8,
            },
        ];
    },
}));

export const mockLogger: Partial<Logger> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

describe("L1MetricsService", () => {
    let l1MetricsService: L1MetricsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                L1MetricsService,
                {
                    provide: L1MetricsService,
                    useFactory: (
                        evmProviderService: EvmProviderService,
                        pricingService: IPricingService,
                        logger: Logger,
                    ) => {
                        return new L1MetricsService(evmProviderService, pricingService, logger);
                    },
                    inject: [EvmProviderService, PRICING_PROVIDER, WINSTON_MODULE_PROVIDER],
                },
                {
                    provide: EvmProviderService,
                    useValue: mockEvmProviderService,
                },
                {
                    provide: PRICING_PROVIDER,
                    useValue: mockPricingService,
                },
                {
                    provide: WINSTON_MODULE_PROVIDER,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        l1MetricsService = module.get<L1MetricsService>(L1MetricsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("constructor", () => {
        it("initialize bridgeHub and sharedBridge", () => {
            expect(l1MetricsService["bridgeHub"]).toEqual({
                abi: bridgeHubAbi,
                address: L1_CONTRACTS.BRIDGE_HUB,
            });
            expect(l1MetricsService["sharedBridge"]).toEqual({
                abi: sharedBridgeAbi,
                address: L1_CONTRACTS.SHARED_BRIDGE,
            });
        });

        it("initialize diamondContracts map as empty", () => {
            expect(l1MetricsService["diamondContracts"].size).toBe(0);
        });
    });

    describe("l1Tvl", () => {
        it("return the TVL on L1 Shared Bridge", async () => {
            const mockBalances = [60_841_657_140641n, 135_63005559n, 123_803_824374847279970609n]; // Mocked balances
            const mockPrices = { "wrapped-bitcoin": 66_129, "usd-coin": 0.999, ethereum: 3_181.09 }; // Mocked prices

            jest.spyOn(mockEvmProviderService, "batchRequest").mockResolvedValue([mockBalances]);
            jest.spyOn(mockPricingService, "getTokenPrices").mockResolvedValue(mockPrices);

            const result = await l1MetricsService.l1Tvl();

            expect(result).toHaveLength(3);
            expect(result).toEqual([
                {
                    amount: "123803.824374847279970609",
                    amountUsd: expect.stringContaining("393831107.68"),
                    price: "3181.09",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "60841657.140641",
                    amountUsd: expect.stringContaining("60780815.48"),
                    price: "0.999",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "135.63005559",
                    amountUsd: expect.stringContaining("8969079.94"),
                    price: "66129",
                    name: "Wrapped BTC",
                    symbol: "WBTC",
                    contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
                    type: "erc20",
                    decimals: 8,
                },
            ]);
            expect(mockEvmProviderService.batchRequest).toHaveBeenCalledWith(
                tokenBalancesAbi,
                tokenBalancesBytecode,
                [
                    L1_CONTRACTS.SHARED_BRIDGE,
                    [
                        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                    ],
                ],
                [
                    {
                        type: "uint256[]",
                    },
                ],
            );
            expect(mockPricingService.getTokenPrices).toHaveBeenCalledWith([
                "ethereum",
                "usd-coin",
                "wrapped-bitcoin",
            ]);
        });

        it("throws an error if the balances length is invalid", async () => {
            jest.spyOn(mockEvmProviderService, "batchRequest").mockResolvedValue([[]]);

            await expect(l1MetricsService.l1Tvl()).rejects.toThrowError("Invalid balances length");
        });

        it("throws an error if the prices length is invalid", async () => {
            jest.spyOn(mockEvmProviderService, "batchRequest").mockResolvedValue([
                [60_841_657_140641n, 135_63005559n, 123_803_824374847279970609n],
            ]);
            jest.spyOn(mockPricingService, "getTokenPrices").mockResolvedValue({
                ethereum: 3_181.09,
                "usd-coin": 0.999,
            });

            await expect(l1MetricsService.l1Tvl()).rejects.toThrowError("Invalid prices length");
        });
    });

    describe("getBatchesInfo", () => {
        it("return getBatchesInfo", async () => {
            const result = await l1MetricsService.getBatchesInfo(1);
            expect(result).toEqual({ commited: 100, verified: 100, proved: 100 });
        });
    });

    describe("tvl", () => {
        it("return the TVL for chain id", async () => {
            const mockBalances = [60_841_657_140641n, 135_63005559n, 123_803_824374847279970609n]; // Mocked balances
            const mockPrices = { "wrapped-bitcoin": 66_129, "usd-coin": 0.999, ethereum: 3_181.09 }; // Mocked prices
            const chainId = 324; // this is ZKsyncEra chain id

            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue(mockBalances);
            jest.spyOn(mockPricingService, "getTokenPrices").mockResolvedValue(mockPrices);

            const result = await l1MetricsService.tvl(chainId);

            expect(result).toHaveLength(3);
            expect(result).toEqual([
                {
                    amount: "123803.824374847279970609",
                    amountUsd: expect.stringContaining("393831107.68"),
                    price: "3181.09",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "60841657.140641",
                    amountUsd: expect.stringContaining("60780815.48"),
                    price: "0.999",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "135.63005559",
                    amountUsd: expect.stringContaining("8969079.94"),
                    price: "66129",
                    name: "Wrapped BTC",
                    symbol: "WBTC",
                    contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
                    type: "erc20",
                    decimals: 8,
                },
            ]);
            expect(mockEvmProviderService.multicall).toHaveBeenCalledWith({
                contracts: [
                    {
                        address: L1_CONTRACTS.SHARED_BRIDGE,
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [BigInt(chainId), "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
                    },
                    {
                        address: L1_CONTRACTS.SHARED_BRIDGE,
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [BigInt(chainId), "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"],
                    },
                    {
                        address: L1_CONTRACTS.SHARED_BRIDGE,
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [BigInt(chainId), ETH_TOKEN_ADDRESS],
                    },
                ],
                allowFailure: false,
            });
            expect(mockPricingService.getTokenPrices).toHaveBeenCalledWith([
                "ethereum",
                "usd-coin",
                "wrapped-bitcoin",
            ]);
        });

        it("throws an error if the prices length is invalid", async () => {
            const chainId = 324;
            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue([
                60_841_657_140641n,
                135_63005559n,
                123_803_824374847279970609n,
            ]);
            jest.spyOn(mockPricingService, "getTokenPrices").mockResolvedValue({
                ethereum: 3_181.09,
                "usd-coin": 0.999,
            });

            await expect(l1MetricsService.tvl(chainId)).rejects.toThrowError(
                "Invalid prices length",
            );
        });
    });

    describe("chainType", () => {
        it("return chainType", async () => {
            const result = await l1MetricsService.chainType(1);
            expect(result).toBe("rollup");
        });
    });

    describe("ethGasInfo", () => {
        it("return ethGasInfo", async () => {
            const result = await l1MetricsService.ethGasInfo();
            expect(result).toEqual({ gasPrice: 50, ethTransfer: 21000, erc20Transfer: 65000 });
        });
    });

    describe("feeParams", () => {
        it("return feeParams", async () => {
            const result = await l1MetricsService.feeParams(1);
            expect(result).toEqual({
                batchOverheadL1Gas: 50000,
                maxPubdataPerBatch: 120000,
                maxL2GasPerBatch: 10000000,
                priorityTxMaxPubdata: 15000,
                minimalL2GasPrice: 10000000,
            });
        });
    });
});
