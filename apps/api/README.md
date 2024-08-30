# ZKchainHub API

## Overview

The `@zkchainhub/api` app is an Express server that exposes an API where you can fetch information about ZKsync ecosystem and their chains.

## 📋 Prerequisites

-   Ensure you have `node >= 20.0.0` and `pnpm >= 9.5.0` installed.

## Installation

```bash
$ pnpm install
```

## Building

To build the monorepo packages, run:

```bash
$ pnpm build
```

## ⚙️ Setting up env variables

-   Create `.env` file and copy paste `.env.example` content in there.

```
$ cp .env.example .env
```

Available options:

-   (optional) `PORT` on which API is made available. By default is port 3000
-   (optional) `ENVIRONMENT` which environment we are using ( 'mainnet' | 'testnet' | 'local'). By default is 'mainnet'
-   `BRIDGE_HUB_ADDRESS`
-   `SHARED_BRIDGE_ADDRESS`
-   `STATE_MANAGER_ADDRESSES` CSV list of State managers addresses
-   `L1_RPC_URLS` as CSV list of RPC URLs. For example, `https://eth.llamarpc.com,https://rpc.flashbots.net/fast`. You can check [Chainlist](https://chainlist.org/) for a list of public RPCs
-   (optional) `PRICING_SOURCE` which pricing source to use ('dummy' | 'coingecko'). By default is dummy
-   (optional) `DUMMY_PRICE` for dummy pricing source. Default is undefined
-   (required if 'coingecko' is selected)`COINGECKO_API_KEY`, `COINGECKO_BASE_URL` and `COINGECKO_API_KEY` depending on your API plan. You can get an API Key creating an account on [Coingecko's site](https://www.coingecko.com/en/api)
-   `METADATA_SOURCE` which metadata source to use ('github' | 'local' | 'static')
-   (required if METADATA_SOURCE is 'github') `METADATA_TOKEN_URL` Metadata tokens URL
-   (required if METADATA_SOURCE is 'github') `METADATA_CHAIN_URL` Metadata chains URL
-   (required if METADATA_SOURCE is 'local') `METADATA_TOKEN_JSON_PATH` Metadata tokens JSON file path (see examples on `packages/metadata`)
-   (required if METADATA_SOURCE is 'local') `METADATA_CHAIN_JSON_PATH` Metadata chain JSON file path (see examples on `packages/metadata`)

## Running the app

```bash
# development watch mode
$ pnpm run dev

# production mode
$ pnpm run start

```

Verify that ZKchainHub API is running on http://localhost:3000 (or the port specified)

## Test

```bash
# unit tests
$ pnpm run test

# test coverage
$ pnpm run test:cov
```

## API

### Metrics routes

-   `GET /metrics/ecosystem`: Retrieves overall ecosystem metrics
-   `GET /metrics/zkchain/:chainId`: Retrieves chain specific metrics

## Docs

Locally Swagger docs are available at http://localhost:3000/docs
