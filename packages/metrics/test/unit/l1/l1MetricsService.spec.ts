import { Address, erc20Abi, zeroAddress } from "viem";
import { afterEach, describe, expect, it, Mocked, vi } from "vitest";

import { EvmProvider, MulticallNotFound } from "@zkchainhub/chain-providers";
import { IMetadataProvider } from "@zkchainhub/metadata";
import { IPricingProvider } from "@zkchainhub/pricing";
import {
    BatchesInfo,
    ChainId,
    ChainType,
    ETH_TOKEN_ADDRESS,
    ILogger,
    Token,
    TokenType,
} from "@zkchainhub/shared";

import {
    bridgeHubAbi,
    diamondProxyAbi,
    FeeParams,
    InvalidChainId,
    InvalidChainType,
    L1MetricsService,
    L1MetricsServiceException,
    multicall3Abi,
    sharedBridgeAbi,
} from "../../../src/internal.js";

const mockTokens: Token<TokenType>[] = [
    {
        name: "Ethereum",
        symbol: "ETH",
        contractAddress: null,
        type: "native",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
        decimals: 18,
    },
    {
        name: "USDC",
        symbol: "USDC",
        contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        imageUrl: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
        type: "erc20",
        decimals: 6,
    },
    {
        name: "Wrapped BTC",
        symbol: "WBTC",
        contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
        type: "erc20",
        decimals: 8,
    },
    {
        name: "Unknown token",
        symbol: "XYZ",
        contractAddress: "0x2260fAc5E5542a2a5aa44fBcfeDF7C193bc2c599",
        type: "erc20",
        decimals: 18,
    },
];

const mockMetricsModule = (
    mockedBridgeHubAddress: Address,
    mockedSharedBridgeAddress: Address,
    mockedSTMAddresses: Address[],
) => {
    const evmProvider = {
        getBlockNumber: vi.fn(),
        estimateGas: vi.fn(),
        getGasPrice: vi.fn(),
        readContract: vi.fn(),
        getMulticall3Address: vi.fn(),
        multicall: vi.fn(),
        getBalance: vi.fn(),
        getStorageAt: vi.fn(),
        getBlockByNumber: vi.fn(),
        batchRequest: vi.fn(),
    } as unknown as EvmProvider;
    const pricingService: Mocked<IPricingProvider> = {
        getTokenPrices: vi.fn(),
    };

    const mockLogger: ILogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    };
    const metadataProvider: IMetadataProvider = {
        getChainsMetadata: vi.fn(),
        getTokensMetadata: vi.fn(),
    };

    const l1Metrics = new L1MetricsService(
        mockedBridgeHubAddress,
        mockedSharedBridgeAddress,
        mockedSTMAddresses,
        evmProvider as EvmProvider,
        pricingService,
        metadataProvider,
        mockLogger,
    );

    return { l1Metrics, pricingService, evmProvider, metadataProvider };
};

describe("l1Metrics", () => {
    const mockedBridgeHubAddress = "0x1234567890123456789012345678901234567890";
    const mockedSharedBridgeAddress = "0x1234567890123456789012345678901234567891";
    const mockedSTMAddresses: Address[] = [
        "0x1234567890123456789012345678901234567892",
        "0x1234567890123456789012345678901234567893",
    ];

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("initialize bridgeHub and sharedBridge", () => {
            const { l1Metrics } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            expect(l1Metrics["bridgeHubAddress"]).toEqual(mockedBridgeHubAddress);
            expect(l1Metrics["sharedBridgeAddress"]).toEqual(mockedSharedBridgeAddress);
            expect(l1Metrics["stateTransitionManagerAddresses"]).toEqual(mockedSTMAddresses);
        });

        it("initialize diamondContracts map as empty", () => {
            const { l1Metrics } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            expect(l1Metrics["diamondContracts"].size).toBe(0);
        });
    });

    describe("l1Tvl", () => {
        it("return the TVL on L1 Shared Bridge", async () => {
            const { l1Metrics, evmProvider, pricingService, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const [, usdc, wbtc, unknown] = mockTokens;
            const mockMulticallBalances = [
                60_841_657_140641n,
                135_63005559n,
                0n,
                123_803_824374847279970609n,
            ]; // Mocked balances

            const mockPrices = {
                [`${wbtc.contractAddress}`]: 66_129,
                [`${usdc.contractAddress}`]: 0.999,
                [`${unknown.contractAddress}`]: undefined,
                [ETH_TOKEN_ADDRESS]: 3_181.09,
            }; // Mocked prices
            const multicallAddress = "0x123452";

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValue(mockTokens);
            vi.spyOn(evmProvider, "getMulticall3Address").mockReturnValue(multicallAddress);
            vi.spyOn(evmProvider, "multicall").mockResolvedValue(mockMulticallBalances);
            vi.spyOn(pricingService, "getTokenPrices").mockResolvedValue(mockPrices);

            const result = await l1Metrics.l1Tvl();

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
            expect(evmProvider.multicall).toHaveBeenCalledWith({
                contracts: [
                    {
                        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                        abi: erc20Abi,
                        functionName: "balanceOf",
                        args: [mockedSharedBridgeAddress],
                    } as const,
                    {
                        address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                        abi: erc20Abi,
                        functionName: "balanceOf",
                        args: [mockedSharedBridgeAddress],
                    } as const,
                    {
                        address: "0x2260fAc5E5542a2a5aa44fBcfeDF7C193bc2c599",
                        abi: erc20Abi,
                        functionName: "balanceOf",
                        args: [mockedSharedBridgeAddress],
                    } as const,
                    {
                        address: multicallAddress,
                        abi: multicall3Abi,
                        functionName: "getEthBalance",
                        args: [mockedSharedBridgeAddress],
                    } as const,
                ],
                allowFailure: false,
            } as const);
            expect(pricingService.getTokenPrices).toHaveBeenCalledWith([
                ETH_TOKEN_ADDRESS,
                usdc.contractAddress,
                wbtc.contractAddress,
                unknown.contractAddress,
            ]);
            expect(evmProvider.getBalance).not.toHaveBeenCalled();
        });

        it("return the TVL on L1 Shared Bridge without multicall", async () => {
            const { l1Metrics, evmProvider, pricingService, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const [, usdc, wbtc, unknown] = mockTokens;

            const mockPrices = {
                [`${wbtc.contractAddress}`]: 66_129,
                [`${usdc.contractAddress}`]: 0.999,
                [`${unknown.contractAddress}`]: undefined,
                [ETH_TOKEN_ADDRESS]: 3_181.09,
            }; // Mocked prices

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValue(mockTokens);
            vi.spyOn(evmProvider, "getMulticall3Address").mockReturnValue(undefined);
            vi.spyOn(evmProvider, "multicall").mockRejectedValue(MulticallNotFound);
            vi.spyOn(evmProvider, "readContract")
                .mockResolvedValueOnce(60_841_657_140641n)
                .mockResolvedValueOnce(135_63005559n)
                .mockResolvedValueOnce(0n);
            vi.spyOn(evmProvider, "getBalance").mockResolvedValue(123_803_824374847279970609n);
            vi.spyOn(pricingService, "getTokenPrices").mockResolvedValue(mockPrices);

            const result = await l1Metrics.l1Tvl();

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
            expect(evmProvider.multicall).not.toHaveBeenCalled();
            expect(evmProvider.readContract).toHaveBeenNthCalledWith(
                1,
                usdc.contractAddress,
                erc20Abi,
                "balanceOf",
                [l1Metrics["sharedBridgeAddress"]],
            );
            expect(evmProvider.readContract).toHaveBeenNthCalledWith(
                2,
                wbtc.contractAddress,
                erc20Abi,
                "balanceOf",
                [l1Metrics["sharedBridgeAddress"]],
            );
            expect(evmProvider.readContract).toHaveBeenNthCalledWith(
                3,
                unknown.contractAddress,
                erc20Abi,
                "balanceOf",
                [l1Metrics["sharedBridgeAddress"]],
            );
            expect(evmProvider.getBalance).toHaveBeenCalledWith(l1Metrics["sharedBridgeAddress"]);
            expect(pricingService.getTokenPrices).toHaveBeenCalledWith([
                ETH_TOKEN_ADDRESS,
                usdc.contractAddress,
                wbtc.contractAddress,
                unknown.contractAddress,
            ]);
        });

        it("throws an error if the balances length is invalid", async () => {
            const { l1Metrics, evmProvider, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValue(mockTokens);
            vi.spyOn(evmProvider, "getMulticall3Address").mockReturnValue("0x123452");
            vi.spyOn(evmProvider, "multicall").mockResolvedValue([]);

            await expect(l1Metrics.l1Tvl()).rejects.toThrowError("Invalid balances length");
        });

        it("throws an error if the prices length is invalid", async () => {
            const { l1Metrics, evmProvider, pricingService, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const [, usdc, wbtc] = mockTokens;

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValue(mockTokens);
            vi.spyOn(evmProvider, "multicall").mockResolvedValue([
                60_841_657_140641n,
                135_63005559n,
                0n,
                123_803_824374847279970609n,
            ]);
            vi.spyOn(evmProvider, "getMulticall3Address").mockReturnValue("0x123452");
            vi.spyOn(pricingService, "getTokenPrices").mockResolvedValue({
                [`${wbtc.contractAddress}`]: 66_129,
                [`${usdc.contractAddress}`]: 0.999,
                [ETH_TOKEN_ADDRESS]: 3_181.09,
            });

            await expect(l1Metrics.l1Tvl()).rejects.toThrowError("Invalid prices length");
        });
    });

    describe("getBatchesInfo", () => {
        it("returns batches info for chain id", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1Metrics["diamondContracts"].set(chainId, mockedDiamondProxyAddress);
            const mockBatchesInfo: BatchesInfo = { commited: 300n, verified: 200n, executed: 100n };
            const batchesInfoMulticallResponse = [
                mockBatchesInfo.commited,
                mockBatchesInfo.verified,
                mockBatchesInfo.executed,
            ];

            vi.spyOn(evmProvider, "multicall").mockResolvedValue(batchesInfoMulticallResponse);

            const result = await l1Metrics.getBatchesInfo(chainId);

            expect(result).toEqual(mockBatchesInfo);
            expect(evmProvider.multicall).toHaveBeenCalledWith({
                contracts: [
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesCommitted",
                        args: [],
                    },
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesVerified",
                        args: [],
                    },
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesExecuted",
                        args: [],
                    },
                ],
                allowFailure: false,
            });
        });

        it("throws if chainId doesn't exist on the ecosystem", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const chainId = 324n; // this is ZKsyncEra chain id
            l1Metrics["diamondContracts"].clear();
            vi.spyOn(evmProvider, "readContract").mockResolvedValue(zeroAddress);
            await expect(l1Metrics.getBatchesInfo(chainId)).rejects.toThrow(InvalidChainId);
        });

        it("fetches and sets diamond proxy if chainId doesn't exists on map", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1Metrics["diamondContracts"].clear();

            const mockBatchesInfo: BatchesInfo = { commited: 300n, verified: 200n, executed: 100n };
            const batchesInfoMulticallResponse = [
                mockBatchesInfo.commited,
                mockBatchesInfo.verified,
                mockBatchesInfo.executed,
            ];

            vi.spyOn(evmProvider, "readContract").mockResolvedValue(mockedDiamondProxyAddress);
            vi.spyOn(evmProvider, "multicall").mockResolvedValue(batchesInfoMulticallResponse);
            const result = await l1Metrics.getBatchesInfo(chainId);

            expect(result).toEqual(mockBatchesInfo);

            expect(l1Metrics["diamondContracts"].get(chainId)).toEqual(mockedDiamondProxyAddress);
            expect(evmProvider.readContract).toHaveBeenCalledWith(
                l1Metrics["bridgeHubAddress"],
                bridgeHubAbi,
                "getHyperchain",
                [chainId],
            );
            expect(evmProvider.multicall).toHaveBeenCalledWith({
                contracts: [
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesCommitted",
                        args: [],
                    },
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesVerified",
                        args: [],
                    },
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesExecuted",
                        args: [],
                    },
                ],
                allowFailure: false,
            });
        });
    });

    describe("fetchDiamondProxyAddress", () => {
        it("returns address if already exists in the map", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";
            l1Metrics["diamondContracts"].clear();
            l1Metrics["diamondContracts"].set(chainId, mockedDiamondProxyAddress);

            const readContractSpy = vi.spyOn(evmProvider, "readContract");
            const result = await l1Metrics["fetchDiamondProxyAddress"](chainId);

            expect(result).toEqual(mockedDiamondProxyAddress);
            expect(l1Metrics["diamondContracts"].get(chainId)).toEqual(mockedDiamondProxyAddress);
            expect(readContractSpy).toHaveBeenCalledTimes(0);
        });
        it("fetches and sets diamond proxy if chainId doesn't exists on map", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1Metrics["diamondContracts"].clear();

            vi.spyOn(evmProvider, "readContract").mockResolvedValue(mockedDiamondProxyAddress);
            const result = await l1Metrics["fetchDiamondProxyAddress"](chainId);

            expect(result).toEqual(mockedDiamondProxyAddress);

            expect(l1Metrics["diamondContracts"].get(chainId)).toEqual(mockedDiamondProxyAddress);
            expect(evmProvider.readContract).toHaveBeenCalledWith(
                l1Metrics["bridgeHubAddress"],
                bridgeHubAbi,
                "getHyperchain",
                [chainId],
            );
        });
    });

    describe("tvl", () => {
        it("return the TVL for chain id", async () => {
            const { l1Metrics, evmProvider, pricingService, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const [, usdc, wbtc, unknown] = mockTokens;
            const mockMulticallBalances = [
                60_841_657_140641n,
                135_63005559n,
                0n,
                123_803_824374847279970609n,
            ]; // Mocked balances
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockPrices = {
                [`${wbtc.contractAddress}`]: 66_129,
                [`${usdc.contractAddress}`]: 0.999,
                [`${unknown.contractAddress}`]: undefined,
                [ETH_TOKEN_ADDRESS]: 3_181.09,
            }; // Mocked prices
            const multicallAddress = "0x123452";

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValue(mockTokens);
            vi.spyOn(evmProvider, "getMulticall3Address").mockReturnValue(multicallAddress);
            vi.spyOn(evmProvider, "multicall").mockResolvedValue(mockMulticallBalances);
            vi.spyOn(pricingService, "getTokenPrices").mockResolvedValue(mockPrices);

            const result = await l1Metrics.tvl(chainId);

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
            expect(evmProvider.multicall).toHaveBeenCalledWith({
                contracts: [
                    {
                        address: l1Metrics["sharedBridgeAddress"],
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [chainId, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
                    },
                    {
                        address: l1Metrics["sharedBridgeAddress"],
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [chainId, "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"],
                    },
                    {
                        address: l1Metrics["sharedBridgeAddress"],
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [chainId, "0x2260fAc5E5542a2a5aa44fBcfeDF7C193bc2c599"],
                    },
                    {
                        address: l1Metrics["sharedBridgeAddress"],
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [chainId, ETH_TOKEN_ADDRESS],
                    },
                ],
                allowFailure: false,
            });
            expect(pricingService.getTokenPrices).toHaveBeenCalledWith([
                ETH_TOKEN_ADDRESS,
                usdc.contractAddress,
                wbtc.contractAddress,
                unknown.contractAddress,
            ]);
        });

        it("return the TVL for chain id without multicall", async () => {
            const { l1Metrics, evmProvider, pricingService, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const [, usdc, wbtc, unknown] = mockTokens;
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockPrices = {
                [`${wbtc.contractAddress}`]: 66_129,
                [`${usdc.contractAddress}`]: 0.999,
                [`${unknown.contractAddress}`]: undefined,
                [ETH_TOKEN_ADDRESS]: 3_181.09,
            }; // Mocked prices

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValue(mockTokens);
            vi.spyOn(evmProvider, "getMulticall3Address").mockReturnValue(undefined);
            vi.spyOn(evmProvider, "multicall").mockRejectedValue(MulticallNotFound);
            vi.spyOn(evmProvider, "readContract")
                .mockResolvedValueOnce(60_841_657_140641n)
                .mockResolvedValueOnce(135_63005559n)
                .mockResolvedValueOnce(0n)
                .mockResolvedValueOnce(123_803_824374847279970609n);
            vi.spyOn(pricingService, "getTokenPrices").mockResolvedValue(mockPrices);

            const result = await l1Metrics.tvl(chainId);

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
            expect(evmProvider.multicall).not.toHaveBeenCalled();
            expect(evmProvider.readContract).toHaveBeenNthCalledWith(
                1,
                l1Metrics["sharedBridgeAddress"],
                sharedBridgeAbi,
                "chainBalance",
                [chainId, usdc.contractAddress],
            );
            expect(evmProvider.readContract).toHaveBeenNthCalledWith(
                2,
                l1Metrics["sharedBridgeAddress"],
                sharedBridgeAbi,
                "chainBalance",
                [chainId, wbtc.contractAddress],
            );
            expect(evmProvider.readContract).toHaveBeenNthCalledWith(
                3,
                l1Metrics["sharedBridgeAddress"],
                sharedBridgeAbi,
                "chainBalance",
                [chainId, unknown.contractAddress],
            );
            expect(evmProvider.readContract).toHaveBeenNthCalledWith(
                4,
                l1Metrics["sharedBridgeAddress"],
                sharedBridgeAbi,
                "chainBalance",
                [chainId, ETH_TOKEN_ADDRESS],
            );
            expect(pricingService.getTokenPrices).toHaveBeenCalledWith([
                ETH_TOKEN_ADDRESS,
                usdc.contractAddress,
                wbtc.contractAddress,
                unknown.contractAddress,
            ]);
        });

        it("throws an error if the prices length is invalid", async () => {
            const { l1Metrics, evmProvider, pricingService, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const chainId = 324n; // this is ZKsyncEra chain id
            const [, usdc, wbtc] = mockTokens;

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValue(mockTokens);
            vi.spyOn(evmProvider, "multicall").mockResolvedValue([
                60_841_657_140641n,
                135_63005559n,
                0n,
                123_803_824374847279970609n,
            ]);
            vi.spyOn(evmProvider, "getMulticall3Address").mockReturnValue("0x123452");
            vi.spyOn(pricingService, "getTokenPrices").mockResolvedValue({
                [`${wbtc.contractAddress}`]: 66_129,
                [`${usdc.contractAddress}`]: 0.999,
                [ETH_TOKEN_ADDRESS]: 3_181.09,
            });

            await expect(l1Metrics.tvl(chainId)).rejects.toThrowError("Invalid prices length");
        });
    });

    describe("chainType", () => {
        it("returns chainType", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1Metrics["diamondContracts"].set(chainId, mockedDiamondProxyAddress);
            const mockChainType: ChainType = "Rollup";

            const readContractSpy = vi.spyOn(evmProvider, "readContract").mockResolvedValue(0);

            const result = await l1Metrics.chainType(chainId);

            expect(result).toEqual(mockChainType);
            expect(readContractSpy).toHaveBeenCalledWith(
                mockedDiamondProxyAddress,
                diamondProxyAbi,
                "getPubdataPricingMode",
                [],
            );
        });
        it("returns chainType", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1Metrics["diamondContracts"].set(chainId, mockedDiamondProxyAddress);
            const mockChainType: ChainType = "Validium";

            const readContractSpy = vi.spyOn(evmProvider, "readContract").mockResolvedValue(1);

            const result = await l1Metrics.chainType(chainId);

            expect(result).toEqual(mockChainType);
            expect(readContractSpy).toHaveBeenCalledWith(
                mockedDiamondProxyAddress,
                diamondProxyAbi,
                "getPubdataPricingMode",
                [],
            );
        });
        it("throws if blockchain returns an out of bounds index", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1Metrics["diamondContracts"].set(chainId, mockedDiamondProxyAddress);

            vi.spyOn(evmProvider, "readContract").mockResolvedValue(100);

            await expect(l1Metrics.chainType(chainId)).rejects.toThrowError(InvalidChainType);
        });
    });

    describe("ethGasInfo", () => {
        it("returns gas information from L1", async () => {
            const { l1Metrics, evmProvider, pricingService, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            // Mock the necessary dependencies
            const mockGetGasPrice = vi.spyOn(evmProvider, "getGasPrice");
            mockGetGasPrice.mockResolvedValueOnce(BigInt(50000000000)); // gasPrice
            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValueOnce(mockTokens);
            const mockGetTokenPrices = vi.spyOn(pricingService, "getTokenPrices");
            mockGetTokenPrices.mockResolvedValueOnce({ [ETH_TOKEN_ADDRESS]: 2000 }); // ethPriceInUsd
            // Call the method
            const result = await l1Metrics.ethGasInfo();

            // Assertions

            expect(mockGetGasPrice).toHaveBeenCalledTimes(1);

            expect(mockGetTokenPrices).toHaveBeenCalledTimes(1);
            expect(mockGetTokenPrices).toHaveBeenCalledWith([ETH_TOKEN_ADDRESS]);

            expect(result).toEqual({
                gasPrice: 50000000000n,
                ethPrice: 2000,
                ethTransfer: 21000n,
                erc20Transfer: 65000n,
            });
        });

        it("returns gas information from L1 without price", async () => {
            const { l1Metrics, evmProvider, pricingService, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );

            const mockGetGasPrice = vi.spyOn(evmProvider, "getGasPrice");
            mockGetGasPrice.mockResolvedValueOnce(BigInt(50000000000)); // gasPrice
            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValueOnce(mockTokens);
            const mockGetTokenPrices = vi.spyOn(pricingService, "getTokenPrices");
            mockGetTokenPrices.mockRejectedValueOnce(new Error("Failed to get token prices"));

            const result = await l1Metrics.ethGasInfo();

            // Assertions
            expect(result).toEqual({
                gasPrice: 50000000000n,
                ethPrice: undefined,
                ethTransfer: 21000n,
                erc20Transfer: 65000n,
            });

            expect(mockGetGasPrice).toHaveBeenCalledTimes(1);

            expect(mockGetTokenPrices).toHaveBeenCalledTimes(1);
            expect(mockGetTokenPrices).toHaveBeenCalledWith([ETH_TOKEN_ADDRESS]);
        });

        it("throws l1MetricsException when getGasPrice fails", async () => {
            const { l1Metrics, evmProvider, pricingService } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            // Mock the necessary dependencies
            const mockEstimateGas = vi.spyOn(evmProvider, "estimateGas");
            mockEstimateGas.mockResolvedValueOnce(BigInt(21000)); // ethTransferGasCost
            mockEstimateGas.mockResolvedValueOnce(BigInt(65000)); // erc20TransferGasCost

            const mockGetGasPrice = vi.spyOn(evmProvider, "getGasPrice");
            mockGetGasPrice.mockRejectedValueOnce(new Error("Failed to get gas price"));

            const mockGetTokenPrices = vi.spyOn(pricingService, "getTokenPrices");
            mockGetTokenPrices.mockResolvedValueOnce({ [ETH_TOKEN_ADDRESS]: 2000 }); // ethPriceInUsd

            // Call the method and expect it to throw l1MetricsException
            await expect(l1Metrics.ethGasInfo()).rejects.toThrow(L1MetricsServiceException);

            expect(mockGetGasPrice).toHaveBeenCalledTimes(1);
            expect(mockGetTokenPrices).not.toHaveBeenCalled();
        });
    });

    describe("getChainIds", () => {
        it("returns chainIds", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const mockedMulticallReturnValue = [
                [1n, 2n, 3n],
                [4n, 5n, 6n],
            ];
            vi.spyOn(evmProvider, "multicall").mockResolvedValue(mockedMulticallReturnValue);

            const result = await l1Metrics.getChainIds();

            expect(result).toEqual(mockedMulticallReturnValue.flat());
            expect(l1Metrics["chainIds"]).toEqual(mockedMulticallReturnValue.flat());
        });
        it("returns chainIds previously setted up", async () => {
            const mockedChainIds = [1n, 2n, 3n, 4n, 5n];
            const { l1Metrics } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            l1Metrics["chainIds"] = mockedChainIds;

            const result = await l1Metrics.getChainIds();

            expect(result).toEqual(mockedChainIds);
        });
        it("returns empty array if chainIds are empty", async () => {
            const mockedChainIds: bigint[] = [];
            const { l1Metrics } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            l1Metrics["chainIds"] = mockedChainIds;

            const result = await l1Metrics.getChainIds();

            expect(result).toEqual(mockedChainIds);
        });
        it("throws if multicall throws", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            vi.spyOn(evmProvider, "multicall").mockRejectedValue(new Error());
            await expect(l1Metrics.getChainIds()).rejects.toThrow(Error);
        });
    });

    describe("getBaseTokens", () => {
        it("returns known tokens", async () => {
            const { l1Metrics, evmProvider, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const mockedChainIds = [1n, 2n];
            const knownTokenAddress1 = mockTokens[1].contractAddress;
            const knownTokenAddress2 = mockTokens[1].contractAddress;

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValueOnce(mockTokens);

            const mockedMulticallReturnValue = [knownTokenAddress1, knownTokenAddress2];
            vi.spyOn(evmProvider, "multicall").mockResolvedValue(mockedMulticallReturnValue);
            const mockedReturnData: Token<TokenType>[] = [
                mockTokens[1] as Token<"erc20">,
                mockTokens[1] as Token<"erc20">,
            ];

            const result = await l1Metrics.getBaseTokens(mockedChainIds);

            expect(result).toEqual(mockedReturnData);
        });
        it("returns unknown tokens", async () => {
            const { l1Metrics, evmProvider, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const mockedChainIds = [1n, 2n];
            const mockedMulticallReturnValue = [
                "0x1234567890123456789012345678901234567123",
                "0x1234567890123456789012345678901234567345",
            ];

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValueOnce(mockTokens);
            vi.spyOn(evmProvider, "multicall").mockResolvedValue(mockedMulticallReturnValue);
            const mockedReturnData: Token<TokenType>[] = [
                {
                    contractAddress: "0x1234567890123456789012345678901234567123",
                    symbol: "unknown",
                    name: "unknown",
                    decimals: 18,
                    type: "erc20",
                },
                {
                    contractAddress: "0x1234567890123456789012345678901234567345",
                    symbol: "unknown",
                    name: "unknown",
                    decimals: 18,
                    type: "erc20",
                },
            ];

            const result = await l1Metrics.getBaseTokens(mockedChainIds);

            expect(result).toEqual(mockedReturnData);
        });
        it("returns unknown tokens if token metadata is empty", async () => {
            const { l1Metrics, evmProvider, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const mockedChainIds = [1n, 2n];
            const mockedMulticallReturnValue = [
                "0x1234567890123456789012345678901234567123",
                "0x1234567890123456789012345678901234567345",
            ];

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValueOnce([]);
            vi.spyOn(evmProvider, "multicall").mockResolvedValue(mockedMulticallReturnValue);
            const mockedReturnData: Token<TokenType>[] = [
                {
                    contractAddress: "0x1234567890123456789012345678901234567123",
                    symbol: "unknown",
                    name: "unknown",
                    decimals: 18,
                    type: "erc20",
                },
                {
                    contractAddress: "0x1234567890123456789012345678901234567345",
                    symbol: "unknown",
                    name: "unknown",
                    decimals: 18,
                    type: "erc20",
                },
            ];

            const result = await l1Metrics.getBaseTokens(mockedChainIds);

            expect(result).toEqual(mockedReturnData);
        });
        it("returns empty array if chainIds is empty", async () => {
            const { l1Metrics, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValueOnce(mockTokens);
            const mockedChainIds: ChainId[] = [];
            const result = await l1Metrics.getBaseTokens(mockedChainIds);
            expect(result).toEqual([]);
        });
        it("throws if multicall fails", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const mockedChainIds: ChainId[] = [1n, 2n];
            vi.spyOn(evmProvider, "multicall").mockRejectedValue(new Error());
            await expect(l1Metrics.getBaseTokens(mockedChainIds)).rejects.toThrow(Error);
        });
        it("returns eth token", async () => {
            const { l1Metrics, evmProvider, metadataProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const mockedChainIds = [1n, 2n];
            const knownTokenAddress1 = ETH_TOKEN_ADDRESS;
            const knownTokenAddress2 = ETH_TOKEN_ADDRESS;

            vi.spyOn(metadataProvider, "getTokensMetadata").mockResolvedValueOnce(mockTokens);

            const mockedMulticallReturnValue = [knownTokenAddress1, knownTokenAddress2];
            vi.spyOn(evmProvider, "multicall").mockResolvedValue(mockedMulticallReturnValue);
            const mockedReturnData: Token<TokenType>[] = [
                mockTokens[0] as Token<"erc20">,
                mockTokens[0] as Token<"erc20">,
            ];

            const result = await l1Metrics.getBaseTokens(mockedChainIds);

            expect(result).toEqual(mockedReturnData);
        });
    });

    describe("feeParams", () => {
        it("should retrieve the fee parameters for a specific chain", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            // Mock the dependencies
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";
            const mockFeeParamsRawData =
                "0x00000000000000000000000ee6b280000182b804c4b4000001d4c0000f424000";

            const mockFeeParams: FeeParams = {
                pubdataPricingMode: 0,
                batchOverheadL1Gas: 1000000,
                maxPubdataPerBatch: 120000,
                maxL2GasPerBatch: 80000000,
                priorityTxMaxPubdata: 99000,
                minimalL2GasPrice: 250000000n,
            };

            l1Metrics["diamondContracts"].set(chainId, mockedDiamondProxyAddress);
            vi.spyOn(evmProvider, "getStorageAt").mockResolvedValue(mockFeeParamsRawData);

            const result = await l1Metrics.feeParams(chainId);

            expect(evmProvider.getStorageAt).toHaveBeenCalledWith(
                mockedDiamondProxyAddress,
                `0x26`,
            );

            expect(result).toEqual(mockFeeParams);
        });

        it("should throw an exception if the fee parameters cannot be retrieved from L1", async () => {
            const { l1Metrics, evmProvider } = mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            // Mock the dependencies
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";
            l1Metrics["diamondContracts"].set(chainId, mockedDiamondProxyAddress);

            vi.spyOn(evmProvider, "getStorageAt").mockResolvedValue(undefined);

            await expect(l1Metrics.feeParams(chainId)).rejects.toThrow(L1MetricsServiceException);
        });
    });
});
