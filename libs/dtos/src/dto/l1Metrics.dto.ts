import { ApiProperty } from "@nestjs/swagger";

export class AssetDistribution {
    [asset: string]: number;
}

export class BatchesInfo {
    @ApiProperty()
    commited!: number;

    @ApiProperty()
    verified!: number;

    @ApiProperty()
    proved!: number;
}

export class EthGasInfo {
    @ApiProperty()
    gasPrice!: number;

    @ApiProperty()
    ethTransfer!: number;

    @ApiProperty()
    erc20Transfer!: number;
}

export class FeeParams {
    @ApiProperty()
    batchOverheadL1Gas!: number;

    @ApiProperty()
    maxPubdataPerBatch!: number;

    @ApiProperty()
    maxL2GasPerBatch!: number;

    @ApiProperty()
    priorityTxMaxPubdata!: number;

    @ApiProperty()
    minimalL2GasPrice!: number;
}
