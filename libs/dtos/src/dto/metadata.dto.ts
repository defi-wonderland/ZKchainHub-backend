export class RPC {
    url: string;
    status?: boolean;

    constructor(data: RPC) {
        this.url = data.url;
        this.status = data.status;
    }
}

export class Metadata {
    iconUrl?: string;
    chainName: string;
    publicRpcs: RPC[];
    explorerUrl: string;
    launchDate: number;
    environment: string;
    nativeToken: string;

    constructor(data: Metadata) {
        this.iconUrl = data.iconUrl;
        this.chainName = data.chainName;
        this.publicRpcs = data.publicRpcs;
        this.explorerUrl = data.explorerUrl;
        this.launchDate = data.launchDate;
        this.environment = data.environment;
        this.nativeToken = data.nativeToken;
    }
}
