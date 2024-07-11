import { ApiProperty } from "@nestjs/swagger";
import {
    AssetDistribution,
    BatchesInfo,
    EthGasInfo,
    FeeParams,
} from "@shared/dtos/dto/l1Metrics.dto";
import { Chains, ChainType } from "@shared/dtos/types";

export class EcosystemInfo {
    @ApiProperty({
        example: { ETH: 1000000, ZK: 500000 },
        description: "A map of asset names to their respective amounts",
        additionalProperties: {
            type: "number",
        },
    })
    l1Tvl!: AssetDistribution;

    @ApiProperty({
        example: { "1": { commited: 100, verified: 90, proved: 80 } },
        description: "Batches info for each chain id",
        additionalProperties: {
            type: "number",
        },
    })
    getBatchesInfo!: Record<number, BatchesInfo>;

    @ApiProperty({ enum: Chains, enumName: "ChainType" })
    chainType!: ChainType;

    ethGasInfo!: EthGasInfo;

    feeParams!: FeeParams;
}
