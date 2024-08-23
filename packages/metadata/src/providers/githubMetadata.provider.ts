import axios, { AxiosInstance } from "axios";
import { z } from "zod";

import {
    Cache,
    ILogger,
    Token,
    TokenType,
    ZKChainMetadata,
    ZKChainMetadataItem,
} from "@zkchainhub/shared";

import { IMetadataProvider } from "../interfaces/index.js";
import { FetchError, InvalidSchema } from "../internal.js";
import { ChainSchema, TokenSchema } from "../schemas/index.js";

export const GITHUB_METADATA_PREFIX = "github-metadata";

/**
 * Represents a provider for retrieving metadata from GitHub.
 */
export class GithubMetadataProvider implements IMetadataProvider {
    private readonly axios: AxiosInstance;
    constructor(
        private readonly tokenJsonUrl: string,
        private readonly chainJsonUrl: string,
        private readonly logger: ILogger,
        private readonly cache: Cache,
    ) {
        this.axios = axios.create({
            headers: {
                Accept: "application/json",
            },
        });
    }

    async getChainsMetadata(): Promise<ZKChainMetadata> {
        let cachedData = await this.cache.get<ZKChainMetadata | undefined>(
            `${GITHUB_METADATA_PREFIX}-chains`,
        );
        if (!cachedData) {
            const { data } = await this.axios.get(this.chainJsonUrl).catch((e) => {
                this.logger.error(
                    `Failed to fetch chains metadata from ${this.chainJsonUrl}: ${e.message}`,
                );
                throw new FetchError(`Failed to fetch chains metadata: ${e.message}`);
            });

            const validatedData = z.array(ChainSchema).safeParse(data);

            if (!validatedData.success) {
                this.logger.error(`Invalid ZKChain metadata: ${validatedData.error.errors}`);
                throw new InvalidSchema("Invalid ZKChain metadata");
            }

            cachedData = validatedData.data.reduce((acc, chain) => {
                const { chainId, ...rest } = chain;
                const chainIdBn = BigInt(chainId);
                acc.set(chainIdBn, { ...rest, chainId: chainIdBn });
                return acc;
            }, new Map<bigint, ZKChainMetadataItem>());

            await this.cache.set(`${GITHUB_METADATA_PREFIX}-chains`, cachedData);
        }

        return cachedData;
    }

    async getTokensMetadata(): Promise<Token<TokenType>[]> {
        let cachedData = await this.cache.get<Token<TokenType>[] | undefined>(
            `${GITHUB_METADATA_PREFIX}-tokens`,
        );

        if (!cachedData) {
            const { data } = await this.axios.get(this.tokenJsonUrl).catch((e) => {
                this.logger.error(
                    `Failed to fetch chains metadata from ${this.chainJsonUrl}: ${e.message}`,
                );
                throw new FetchError(`Failed to fetch chains metadata: ${e.message}`);
            });

            const validatedData = z.array(TokenSchema).safeParse(data);

            if (!validatedData.success) {
                this.logger.error(`Invalid Token metadata: ${validatedData.error.errors}`);
                throw new InvalidSchema("Invalid Token metadata");
            }

            cachedData = validatedData.data;

            await this.cache.set(`${GITHUB_METADATA_PREFIX}-tokens`, cachedData);
        }
        return cachedData;
    }
}
