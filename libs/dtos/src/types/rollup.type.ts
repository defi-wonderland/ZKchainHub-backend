export const Chains = ["Rollup", "Validium"] as const;

export type ChainType = (typeof Chains)[number];
