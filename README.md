# Hyperhub

## Description

The Hyperhub project for zkSync involves the creation of a comprehensive data management system. This project is designed to provide key insights into the zkSync network, making it an invaluable tool for users and developers.

## Packages

- `@hyperhub/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@hyperhub/serverless`: Includes all serverless functions from the repository.

## Dev Environment

To install and build all apps and packages, run the following command:

```
yarn && yarn build
```

Here `yarn`: Install deps, create symlinks, hoist packages.
And `yarn build` Build all packages.

Individual commands can be run against workspaces as so (example for serverless package):

```
yarn workspace @hyperhub/serverless dev
```

## Running tests

To test for the complete repository run:

```
yarn build && yarn test
```

If you want to test just a package:

```
yarn workspace @huperhub/serverless build
yarn workspace @hyperhub/serverless test
```

## Creating a new package

<!-- //TODO: add a boilerplate tool -->

You can just create a new folder within `packages` and copy and paste stuff from other packages.

## Installing dependencies

For global dependencies:

```
yarn add ethers
```

To add new dependencies to an specific package you should be able to do everything from the root and not need to go into the individual package dirs.
You can run for example:

```
yarn workspace @hyperhub/serverless add ethers
```
