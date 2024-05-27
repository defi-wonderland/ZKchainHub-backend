import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    // js files
    {
      plugins: {
        "@typescript-eslint": tsPlugin,
        prettier: prettierPlugin,
      },
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaFeatures: { modules: true },
          ecmaVersion: 2022,
          project: "@hyperhub/ts-config/base",
        },
      },
      rules: {
        ...tsPlugin.configs["eslint-recommended"].rules,
        ...tsPlugin.configs["recommended"].rules,
        ...prettierPlugin.configs.recommended.rules,
        ...eslintConfigPrettier.rules,
      },
    },
  ];