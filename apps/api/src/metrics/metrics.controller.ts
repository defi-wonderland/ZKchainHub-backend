import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ParsePositiveIntPipe } from "apps/api/src/common/pipes/parsePositiveInt.pipe";
import { getEcosystemInfo } from "apps/api/src/metrics/mocks/metrics.mock";

@ApiTags("metrics")
@Controller("metrics")
/**
 * Controller for handling metrics related endpoints.
 */
export class MetricsController {
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
     * @returns {Promise<ChainInfo>} The chain information.
     */
    @Get("zkchain/:chainId")
    public async getChain(@Param("chainId", new ParsePositiveIntPipe()) _chainId: number) {
        throw new Error("Not implemented");
    }
}
