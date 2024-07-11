import { EcosystemInfo } from "@shared/dtos";

export const getEcosystemInfo = () => {
    const mock = new EcosystemInfo();
    mock.chainType = "Rollup";
    mock.l1Tvl = { ETH: 1000000, USDC: 500000 };
    mock.getBatchesInfo = {
        1: { commited: 100, verified: 90, proved: 80 },
        2: { commited: 200, verified: 180, proved: 160 },
    };
    mock.ethGasInfo = {
        gasPrice: 50,
        ethTransfer: 21000,
        erc20Transfer: 65000,
    };
    mock.feeParams = {
        batchOverheadL1Gas: 50000,
        maxPubdataPerBatch: 120000,
        maxL2GasPerBatch: 10000000,
        priorityTxMaxPubdata: 15000,
        minimalL2GasPrice: 0.25,
    };
    return mock;
};
