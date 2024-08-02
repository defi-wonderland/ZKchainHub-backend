import BigNumber from "bignumber.js";

export const parseUnits = (value: bigint, decimals: number): number => {
    return BigNumber(value.toString())
        .div(10 ** decimals)
        .toNumber();
};
