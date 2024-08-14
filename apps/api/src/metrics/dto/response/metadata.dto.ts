/**
 * Metadata class representing the metadata information.
 */
export class Metadata {
    /**
     * The URL of the chain's icon (optional).
     * @type {string}
     * @memberof Metadata
     */
    iconUrl: string;

    /**
     * The name of the chain.
     * @type {string}
     * @memberof Metadata
     */
    chainName: string;

    /**
     * An array of public RPCs.
     * @type {RPC[]}
     * @memberof Metadata
     */
    publicRpcs: string[];

    /**
     * The URL of the chain's explorer.
     * @type {string}
     * @memberof Metadata
     */
    explorerUrl: string;

    /**
     * The launch date of the chain (timestamp).
     * @type {number}
     * @memberof Metadata
     */
    launchDate: number;

    /**
     * The native token of the chain.
     * @type {string}
     * @memberof Metadata
     */
    baseToken: string;

    constructor(data: Metadata) {
        this.iconUrl = data.iconUrl;
        this.chainName = data.chainName;
        this.publicRpcs = data.publicRpcs;
        this.explorerUrl = data.explorerUrl;
        this.launchDate = data.launchDate;
        this.baseToken = data.baseToken;
    }
}
