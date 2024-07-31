export const sharedBridgeAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_l1WethAddress",
                type: "address",
            },
            {
                internalType: "contract IBridgehub",
                name: "_bridgehub",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_eraChainId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_eraDiamondProxy",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "l1Token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "BridgehubDepositBaseTokenInitiated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "txDataHash",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "l2DepositTxHash",
                type: "bytes32",
            },
        ],
        name: "BridgehubDepositFinalized",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "txDataHash",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "l1Token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "BridgehubDepositInitiated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "l1Token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "ClaimedFailedDepositSharedBridge",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint8",
                name: "version",
                type: "uint8",
            },
        ],
        name: "Initialized",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "l2DepositTxHash",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "l1Token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "LegacyDepositInitiated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferStarted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "Paused",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "Unpaused",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "l1Token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "WithdrawalFinalizedSharedBridge",
        type: "event",
    },
    {
        inputs: [],
        name: "BRIDGE_HUB",
        outputs: [
            {
                internalType: "contract IBridgehub",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "ERA_CHAIN_ID",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "ERA_DIAMOND_PROXY",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "L1_WETH_TOKEN",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "acceptOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_chainId",
                type: "uint256",
            },
            {
                internalType: "bytes32",
                name: "_txDataHash",
                type: "bytes32",
            },
            {
                internalType: "bytes32",
                name: "_txHash",
                type: "bytes32",
            },
        ],
        name: "bridgehubConfirmL2Transaction",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_chainId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_prevMsgSender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_l2Value",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes",
            },
        ],
        name: "bridgehubDeposit",
        outputs: [
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "magicValue",
                        type: "bytes32",
                    },
                    {
                        internalType: "address",
                        name: "l2Contract",
                        type: "address",
                    },
                    {
                        internalType: "bytes",
                        name: "l2Calldata",
                        type: "bytes",
                    },
                    {
                        internalType: "bytes[]",
                        name: "factoryDeps",
                        type: "bytes[]",
                    },
                    {
                        internalType: "bytes32",
                        name: "txDataHash",
                        type: "bytes32",
                    },
                ],
                internalType: "struct L2TransactionRequestTwoBridgesInner",
                name: "request",
                type: "tuple",
            },
        ],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_chainId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_prevMsgSender",
                type: "address",
            },
            {
                internalType: "address",
                name: "_l1Token",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
        ],
        name: "bridgehubDepositBaseToken",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "l1Token",
                type: "address",
            },
        ],
        name: "chainBalance",
        outputs: [
            {
                internalType: "uint256",
                name: "balance",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_chainId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_depositSender",
                type: "address",
            },
            {
                internalType: "address",
                name: "_l1Token",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
            {
                internalType: "bytes32",
                name: "_l2TxHash",
                type: "bytes32",
            },
            {
                internalType: "uint256",
                name: "_l2BatchNumber",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_l2MessageIndex",
                type: "uint256",
            },
            {
                internalType: "uint16",
                name: "_l2TxNumberInBatch",
                type: "uint16",
            },
            {
                internalType: "bytes32[]",
                name: "_merkleProof",
                type: "bytes32[]",
            },
        ],
        name: "claimFailedDeposit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_depositSender",
                type: "address",
            },
            {
                internalType: "address",
                name: "_l1Token",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
            {
                internalType: "bytes32",
                name: "_l2TxHash",
                type: "bytes32",
            },
            {
                internalType: "uint256",
                name: "_l2BatchNumber",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_l2MessageIndex",
                type: "uint256",
            },
            {
                internalType: "uint16",
                name: "_l2TxNumberInBatch",
                type: "uint16",
            },
            {
                internalType: "bytes32[]",
                name: "_merkleProof",
                type: "bytes32[]",
            },
        ],
        name: "claimFailedDepositLegacyErc20Bridge",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                internalType: "bytes32",
                name: "l2DepositTxHash",
                type: "bytes32",
            },
        ],
        name: "depositHappened",
        outputs: [
            {
                internalType: "bytes32",
                name: "depositDataHash",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_prevMsgSender",
                type: "address",
            },
            {
                internalType: "address",
                name: "_l2Receiver",
                type: "address",
            },
            {
                internalType: "address",
                name: "_l1Token",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_l2TxGasLimit",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_l2TxGasPerPubdataByte",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_refundRecipient",
                type: "address",
            },
        ],
        name: "depositLegacyErc20Bridge",
        outputs: [
            {
                internalType: "bytes32",
                name: "l2TxHash",
                type: "bytes32",
            },
        ],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_chainId",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_l2BatchNumber",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_l2MessageIndex",
                type: "uint256",
            },
            {
                internalType: "uint16",
                name: "_l2TxNumberInBatch",
                type: "uint16",
            },
            {
                internalType: "bytes",
                name: "_message",
                type: "bytes",
            },
            {
                internalType: "bytes32[]",
                name: "_merkleProof",
                type: "bytes32[]",
            },
        ],
        name: "finalizeWithdrawal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_l2BatchNumber",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_l2MessageIndex",
                type: "uint256",
            },
            {
                internalType: "uint16",
                name: "_l2TxNumberInBatch",
                type: "uint16",
            },
            {
                internalType: "bytes",
                name: "_message",
                type: "bytes",
            },
            {
                internalType: "bytes32[]",
                name: "_merkleProof",
                type: "bytes32[]",
            },
        ],
        name: "finalizeWithdrawalLegacyErc20Bridge",
        outputs: [
            {
                internalType: "address",
                name: "l1Receiver",
                type: "address",
            },
            {
                internalType: "address",
                name: "l1Token",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_owner",
                type: "address",
            },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_chainId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_l2BridgeAddress",
                type: "address",
            },
        ],
        name: "initializeChainGovernance",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "l2BatchNumber",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "l2ToL1MessageNumber",
                type: "uint256",
            },
        ],
        name: "isWithdrawalFinalized",
        outputs: [
            {
                internalType: "bool",
                name: "isFinalized",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
        ],
        name: "l2BridgeAddress",
        outputs: [
            {
                internalType: "address",
                name: "l2Bridge",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "legacyBridge",
        outputs: [
            {
                internalType: "contract IL1ERC20Bridge",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "paused",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pendingOwner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_chainId",
                type: "uint256",
            },
        ],
        name: "receiveEth",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_token",
                type: "address",
            },
            {
                internalType: "address",
                name: "_target",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_targetChainId",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_gasPerToken",
                type: "uint256",
            },
        ],
        name: "safeTransferFundsFromLegacy",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_eraLegacyBridgeLastDepositBatch",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_eraLegacyBridgeLastDepositTxNumber",
                type: "uint256",
            },
        ],
        name: "setEraLegacyBridgeLastDepositTime",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_eraPostDiamondUpgradeFirstBatch",
                type: "uint256",
            },
        ],
        name: "setEraPostDiamondUpgradeFirstBatch",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_eraPostLegacyBridgeUpgradeFirstBatch",
                type: "uint256",
            },
        ],
        name: "setEraPostLegacyBridgeUpgradeFirstBatch",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_legacyBridge",
                type: "address",
            },
        ],
        name: "setL1Erc20Bridge",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_token",
                type: "address",
            },
            {
                internalType: "address",
                name: "_target",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_targetChainId",
                type: "uint256",
            },
        ],
        name: "transferFundsFromLegacy",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "unpause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;
