import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AssetDistribution, BatchesInfo, FeeParams } from "@shared/dtos/dto/l1Metrics.dto";
import { L2ChainInfo } from "@shared/dtos/dto/l2Metrics.dto";
import { Metadata } from "@shared/dtos/dto/metadata.dto";
import { Chains, ChainType } from "@shared/dtos/types";

export class ZKChainInfo {
    @ApiProperty({ enum: Chains, enumName: "ChainType" })
    chainType: ChainType;

    @ApiProperty({
        example: { ETH: 1000000, ZK: 500000 },
        description: "A map of asset names to their respective amounts",
        additionalProperties: {
            type: "number",
        },
    })
    tvl: AssetDistribution;

    @ApiPropertyOptional()
    batchesInfo?: BatchesInfo;

    feeParams: FeeParams;

    @ApiPropertyOptional({ type: Metadata })
    metadata?: Metadata;

    @ApiPropertyOptional()
    l2ChainInfo?: L2ChainInfo;

    constructor(data: ZKChainInfo) {
        this.chainType = data.chainType;
        this.tvl = data.tvl;
        this.batchesInfo = data.batchesInfo;
        this.feeParams = data.feeParams;
        this.metadata = data.metadata;
        this.l2ChainInfo = data.l2ChainInfo;
    }
}
