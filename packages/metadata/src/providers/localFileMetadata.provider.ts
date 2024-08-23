import { existsSync, readFileSync } from "fs";
import { z } from "zod";

import {
    Cache,
    ILogger,
    Token,
    TokenType,
    ZKChainMetadata,
    ZKChainMetadataItem,
} from "@zkchainhub/shared";

import { FileNotFound, IMetadataProvider, InvalidSchema } from "../internal.js";
import { ChainSchema, TokenSchema } from "../schemas/index.js";

export const LOCALFILE_METADATA_PREFIX = "local-metadata";

/**
 * Represents a provider that retrieves metadata from local files.
 */
export class LocalFileMetadataProvider implements IMetadataProvider {
    /**
     * Constructs a new instance of the LocalFileMetadataProvider class.
     * @param tokenJsonPath The path to the token JSON file.
     * @param chainJsonPath The path to the chain JSON file.
     * @param logger The logger instance.
     * @param cache The cache instance.
     * @throws {FileNotFound} if any of the files is not found.
     */
    constructor(
        private readonly tokenJsonPath: string,
        private readonly chainJsonPath: string,
        private readonly logger: ILogger,
        private readonly cache: Cache,
    ) {
        if (!existsSync(tokenJsonPath)) {
            throw new FileNotFound(tokenJsonPath);
        }

        if (!existsSync(chainJsonPath)) {
            throw new FileNotFound(chainJsonPath);
        }
    }

    /** @inheritdoc */
    async getChainsMetadata(): Promise<ZKChainMetadata> {
        let cachedData = await this.cache.get<ZKChainMetadata>(
            `${LOCALFILE_METADATA_PREFIX}-chains`,
        );
        if (!cachedData) {
            const jsonData = readFileSync(this.chainJsonPath, "utf-8");
            const parsed = JSON.parse(jsonData);

            const validatedData = z.array(ChainSchema).safeParse(parsed);

            if (!validatedData.success) {
                this.logger.error(`Invalid ZKChains metadata: ${validatedData.error.errors}`);
                throw new InvalidSchema("Invalid ZKChains metadata");
            }

            cachedData = validatedData.data.reduce((acc, chain) => {
                const { chainId, ...rest } = chain;
                const chainIdBn = BigInt(chainId);
                acc.set(chainIdBn, { ...rest, chainId: chainIdBn });
                return acc;
            }, new Map<bigint, ZKChainMetadataItem>());

            await this.cache.set(`${LOCALFILE_METADATA_PREFIX}-chains`, cachedData);
        }

        return cachedData;
    }

    /** @inheritdoc */
    async getTokensMetadata(): Promise<Token<TokenType>[]> {
        let cachedData = await this.cache.get<Token<TokenType>[]>(
            `${LOCALFILE_METADATA_PREFIX}-tokens`,
        );
        if (!cachedData) {
            const jsonData = readFileSync(this.tokenJsonPath, "utf-8");
            const parsed = JSON.parse(jsonData);

            const validatedData = z.array(TokenSchema).safeParse(parsed);

            if (!validatedData.success) {
                this.logger.error(`Invalid Tokens metadata: ${validatedData.error.errors}`);
                throw new InvalidSchema("Invalid Tokens metadata");
            }

            cachedData = validatedData.data;

            await this.cache.set(`${LOCALFILE_METADATA_PREFIX}-tokens`, cachedData);
        }

        return cachedData;
    }
}
