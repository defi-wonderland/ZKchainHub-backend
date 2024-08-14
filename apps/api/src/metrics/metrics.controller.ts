import { Controller, Get, Inject, Logger, LoggerService, Param } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { L1MetricsService } from "@zkchainhub/metrics/l1";

// import { zkChainsMetadata } from "@zkchainhub/shared/metadata";

import { ParsePositiveIntPipe } from "../common/pipes/parsePositiveInt.pipe";
import { ZKChainInfo } from "./dto/response";
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
    public async getEcosystem() {
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
