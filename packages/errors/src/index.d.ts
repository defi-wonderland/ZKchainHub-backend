export declare abstract class BaseError extends Error {
    readonly name: string;
    readonly description: string;
    constructor({ name, description }: { name: string; description: string });
    getDescription(): string;
}
//# sourceMappingURL=index.d.ts.map
