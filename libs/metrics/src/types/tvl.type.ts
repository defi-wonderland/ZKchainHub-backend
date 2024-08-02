export type TokenTvl = {
    amount: number;
    amountUsd: number;
    name: string;
    imageUrl?: string;
};

export type Tvl = {
    [asset: string]: TokenTvl;
};
