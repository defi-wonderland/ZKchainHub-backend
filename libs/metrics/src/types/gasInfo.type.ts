export type GasInfo = {
    gasPriceInGwei: string;
    ethPrice?: string; // USD
    ethTransferGas: string; // units of gas
    erc20TransferGas: string; // units of gas
};
