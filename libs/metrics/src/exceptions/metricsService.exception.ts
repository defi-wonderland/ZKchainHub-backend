export class MetricsServiceException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MetricsServiceException";
    }
}

export class L1MetricsServiceException extends MetricsServiceException {
    constructor(message: string) {
        super(message);
        this.name = "L1MetricsServiceException";
    }
}
