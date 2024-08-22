import axios, { AxiosInstance } from "axios";
import { z } from "zod";

import {
    Address,
    ILogger,
    Token,
    TokenType,
    ZKChainMetadata,
    ZKChainMetadataItem,
} from "@zkchainhub/shared";

import { IMetadataProvider } from "../interfaces/index.js";
import { FetchError, InvalidSchema } from "../internal.js";

const TokenSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    coingeckoId: z.string(), // FIXME: on pricing refactor, this should not be part of the token metadata
    type: z.union([z.literal("erc20"), z.literal("native")]),
    contractAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .transform((v) => (v ? (v as Address) : null))
        .nullable(),
    decimals: z.number(),
    imageUrl: z.string().optional(),
});

const ChainSchema = z.object({
    chainId: z.number().positive(),
    name: z.string(),
    iconUrl: z.string().url().optional(),
    publicRpcs: z.array(z.string().url()).default([]),
    explorerUrl: z.string().url().optional(),
    launchDate: z.number().positive(),
    chainType: z.union([z.literal("Rollup"), z.literal("Validium")]),
    baseToken: TokenSchema,
});

/**
 * Represents a provider for retrieving metadata from GitHub.
 */
export class GithubMetadataProvider implements IMetadataProvider {
    private readonly axios: AxiosInstance;
    constructor(
        private readonly tokenJsonUrl: string,
        private readonly chainJsonUrl: string,
        private readonly logger: ILogger,
    ) {
        this.axios = axios.create({
            headers: {
                Accept: "application/json",
            },
        });
    }

    async getChainsMetadata(): Promise<ZKChainMetadata> {
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

        return validatedData.data.reduce((acc, chain) => {
            const { chainId, ...rest } = chain;
            const chainIdBn = BigInt(chainId);
            acc.set(chainIdBn, { ...rest, chainId: chainIdBn });
            return acc;
        }, new Map<bigint, ZKChainMetadataItem>());
    }

    async getTokensMetadata(): Promise<Token<TokenType>[]> {
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

        return validatedData.data;
    }
}
