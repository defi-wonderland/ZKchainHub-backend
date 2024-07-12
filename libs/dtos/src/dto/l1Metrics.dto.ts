export class AssetDistribution {
    [asset: string]: number;
}

export class BatchesInfo {
    commited: number;
    verified: number;
    proved: number;

    constructor(data: BatchesInfo) {
        this.commited = data.commited;
        this.verified = data.verified;
        this.proved = data.proved;
    }
}

export class EthGasInfo {
    gasPrice: number;
    ethTransfer: number;
    erc20Transfer: number;

    constructor(data: EthGasInfo) {
        this.gasPrice = data.gasPrice;
        this.ethTransfer = data.ethTransfer;
        this.erc20Transfer = data.erc20Transfer;
    }
}

export class FeeParams {
    batchOverheadL1Gas: number;
    maxPubdataPerBatch: number;
    maxL2GasPerBatch: number;
    priorityTxMaxPubdata: number;
    minimalL2GasPrice: number;

    constructor(data: FeeParams) {
        this.batchOverheadL1Gas = data.batchOverheadL1Gas;
        this.maxPubdataPerBatch = data.maxPubdataPerBatch;
        this.maxL2GasPerBatch = data.maxL2GasPerBatch;
        this.priorityTxMaxPubdata = data.priorityTxMaxPubdata;
        this.minimalL2GasPrice = data.minimalL2GasPrice;
    }
}
