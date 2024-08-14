import { Controller, Get, Inject, Logger, LoggerService, Param } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { L1MetricsService } from "@zkchainhub/metrics/l1";

// import { zkChainsMetadata } from "@zkchainhub/shared/metadata";

import { ParsePositiveIntPipe } from "../common/pipes/parsePositiveInt.pipe";
import { EcosystemInfo, ZKChainInfo } from "./dto/response";
import { getEcosystemInfo, getZKChainInfo } from "./mocks/metrics.mock";

@ApiTags("metrics")
@Controller("metrics")
/**
 * Controller for handling metrics related endpoints.
 */
export class MetricsController {
    constructor(
        @Inject(Logger) private readonly logger: LoggerService,
        private readonly l1Metrics: L1MetricsService,
    ) {}
    /**
     * Retrieves the ecosystem information.
     * @returns {Promise<EcosystemInfo>} The ecosystem information.
     */
    @Get("/ecosystem")
    public async getEcosystem(): Promise<EcosystemInfo> {
        // const [l1Tvl, gasInfo, chainIds] = await Promise.all([
        //     this.l1MetricsService.l1Tvl(),
        //     this.l1MetricsService.ethGasInfo(),
        //     this.l1MetricsService.getChainIds(),
        // ]);

        // const zkChains = chainIds.map(async (chainId) => {
        //     const metadata = zkChainsMetadata.get(chainId);
        //     if (!metadata) {
        //         return {
        //             chainId,
        //             chainType: await this.l1MetricsService.getChainType(chainId),
        //             baseToken: await this.l1MetricsService.getBaseToken(chainId),
        //             tvl: await this.l1MetricsService.tvl(chainId),
        //             metadata: false,
        //         };
        //     }
        //     return {
        //         chainId,
        //         chainType: metadata.chainType,
        //         baseToken: metadata.baseToken,
        //         tvl: metadata.tvl,
        //         metadata: true,
        //         rpc: false,
        //     };
        // });

        new EcosystemInfo({
            l1Tvl: { ETH: 1000000, USDC: 500000 },
            ethGasInfo: {
                gasPrice: "50",
                ethTransfer: "21000",
                erc20Transfer: "65000",
            },
            zkChains: [
                {
                    chainId: "0",
                    chainType: "Rollup",
                    nativeToken: "ETH",
                    tvl: 1000000,
                    metadata: true,
                    rpc: true,
                },
                {
                    chainId: "1",
                    chainType: "Validium",
                    nativeToken: "ETH",
                    tvl: 500000,
                    metadata: true,
                    rpc: false,
                },
                {
                    chainId: "2",
                    chainType: "Rollup",
                    tvl: 300000,
                    metadata: false,
                    rpc: true,
                },
                {
                    chainId: "3",
                    chainType: "Rollup",
                    tvl: 10000,
                    metadata: false,
                    rpc: false,
                },
            ],
        });
        return getEcosystemInfo();
    }

    /**
     * Retrieves the chain information for the specified chain ID.
     * @param {number} chainId - The ID of the chain.
     * @returns {Promise<ZKChainInfo>} The chain information.
     */

    @ApiResponse({ status: 200, type: ZKChainInfo })
    @Get("zkchain/:chainId")
    public async getChain(
        @Param("chainId", new ParsePositiveIntPipe()) chainId: number,
    ): Promise<ZKChainInfo> {
        return getZKChainInfo(chainId);
    }
}
