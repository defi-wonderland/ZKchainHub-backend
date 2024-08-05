export type GasInfo = {
    gasPriceInGwei: number;
    ethPrice?: number; // USD
    ethTransferGas: number; // units of gas
    erc20TransferGas: number; // units of gas
};
