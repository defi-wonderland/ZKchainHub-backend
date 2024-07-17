/**
 * L2ChainInfo class representing Layer 2 chain information.
 */
export class L2ChainInfo {
    /**
     * Transactions per second.
     * @type {number}
     * @memberof L2ChainInfo
     */
    tps: number;

    /**
     * Average block time in seconds.
     * @type {number}
     * @memberof L2ChainInfo
     */
    avgBlockTime: number;

    /**
     * The number of the last block.
     * @type {number}
     * @memberof L2ChainInfo
     */
    lastBlock: number;

    /**
     * The number of the last verified block.
     * @type {number}
     * @memberof L2ChainInfo
     */
    lastBlockVerified: number;

    /**
     * Constructs an instance of the L2ChainInfo class.
     * @param {L2ChainInfo} data - The data to initialize the instance with.
     */
    constructor(data: L2ChainInfo) {
        this.tps = data.tps;
        this.avgBlockTime = data.avgBlockTime;
        this.lastBlock = data.lastBlock;
        this.lastBlockVerified = data.lastBlockVerified;
    }
}
