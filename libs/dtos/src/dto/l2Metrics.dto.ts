export class L2ChainInfo {
    tps: number;
    avgBlockTime: number;
    lastBlock: number;
    lastBlockVerified: number;

    constructor(data: L2ChainInfo) {
        this.tps = data.tps;
        this.avgBlockTime = data.avgBlockTime;
        this.lastBlock = data.lastBlock;
        this.lastBlockVerified = data.lastBlockVerified;
    }
}
