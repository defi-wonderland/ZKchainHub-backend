import { ApiProperty } from "@nestjs/swagger";
import { AssetDistribution, EthGasInfo } from "@shared/dtos/dto/l1Metrics.dto";
import { Chains, ChainType } from "@shared/dtos/types";

export class EcosystemInfo {
    @ApiProperty({
        example: { ETH: 1000000, ZK: 500000 },
        description: "A map of asset names to their respective amounts",
        additionalProperties: {
            type: "number",
        },
    })
    l1Tvl: AssetDistribution;

    ethGasInfo: EthGasInfo;

    @ApiProperty({ isArray: true })
    zkChains: ZKChainSummary[];

    constructor(data: EcosystemInfo) {
        this.l1Tvl = data.l1Tvl;
        this.ethGasInfo = data.ethGasInfo;
        this.zkChains = data.zkChains;
    }
}

export class ZKChainSummary {
    chainId: number;

    @ApiProperty({ enum: Chains, enumName: "ChainType" })
    chainType: ChainType;

    nativeToken?: string;

    tvl: number;

    metadata?: boolean;

    rpc?: boolean;

    constructor(data: ZKChainSummary) {
        this.chainId = data.chainId;
        this.chainType = data.chainType;
        this.nativeToken = data.nativeToken;
        this.tvl = data.tvl;
        this.metadata = data.metadata;
        this.rpc = data.rpc;
    }
}
