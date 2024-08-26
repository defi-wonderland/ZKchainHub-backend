import { isAddress } from "viem";
import { z } from "zod";

const addressArraySchema = z
    .string()
    .transform((str) => str.split(","))
    .refine((addresses) => addresses.every((address) => isAddress(address)), {
        message: "Must be a comma-separated list of valid Addresses",
    });
const addressSchema = z.string().refine((address) => isAddress(address), {
    message: "Must be a valid Address",
});

const urlArraySchema = z
    .string()
    .transform((str) => str.split(","))
    .refine((urls) => urls.every((url) => z.string().url().safeParse(url).success), {
        message: "Must be a comma-separated list of valid URLs",
    });

export const validationSchema = z
    .object({
        PORT: z.coerce.number().positive().default(3000),
        BRIDGE_HUB_ADDRESS: addressSchema,
        SHARED_BRIDGE_ADDRESS: addressSchema,
        STATE_MANAGER_ADDRESSES: addressArraySchema,
        L1_RPC_URLS: urlArraySchema,
        L2_RPC_URLS: z
            .union([z.literal(""), urlArraySchema])
            .optional()
            .transform((val) => {
                if (val === undefined || val === "") return [];
                return val;
            }),
        COINGECKO_API_KEY: z.string(),
        COINGECKO_BASE_URL: z.string().url().default("https://api.coingecko.com/api/v3/"),
        COINGECKO_API_TYPE: z.enum(["demo", "pro"]).default("demo"),
        CACHE_TTL: z.coerce.number().positive().default(60),
        METADATA_SOURCE: z.enum(["github", "local", "static"]),
        METADATA_TOKEN_URL: z.string().url().optional(),
        METADATA_CHAIN_URL: z.string().url().optional(),
        METADATA_TOKEN_JSON_PATH: z.string().optional(),
        METADATA_CHAIN_JSON_PATH: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.METADATA_SOURCE === "github") {
                return !!data.METADATA_TOKEN_URL && !!data.METADATA_CHAIN_URL;
            }
            if (data.METADATA_SOURCE === "local") {
                return !!data.METADATA_TOKEN_JSON_PATH && !!data.METADATA_CHAIN_JSON_PATH;
            }
            return true;
        },
        {
            message: "Invalid metadata configuration",
            path: ["METADATA_SOURCE"],
        },
    );
