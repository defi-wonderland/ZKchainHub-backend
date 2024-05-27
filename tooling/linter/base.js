import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

const config = {
  extends: [
      "plugin:@typescript-eslint/eslint-plugin",
      "prettier",
  ],
  env: {
      es2022: true,
      node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: { project: true },
  plugins: ["@typescript-eslint", "import"],
  rules: {
      "turbo/no-undeclared-env-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": [
          "warn",
          { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
      "@typescript-eslint/no-misused-promises": [2, { checksVoidReturn: { attributes: false } }],
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
  },
  ignorePatterns: ["**/*.config.js", "**/*.config.cjs", "**/.eslintrc.cjs", "dist", "yarn.lock"],
  reportUnusedDisableDirectives: true,
};


// /** @type {import('eslint').Linter.Config[]} */
// const config = [
//     // js files
//     {
//       plugins: {
//         "@typescript-eslint": tsPlugin,
//         prettier: prettierPlugin,
//       },
//       languageOptions: {
//         parser: tsParser,
//         parserOptions: {
//           ecmaFeatures: { modules: true },
//           ecmaVersion: 2022,
//           project: "@hyperhub/ts-config/base",
//         },
//       },
//       rules: {
//         ...tsPlugin.configs["eslint-recommended"].rules,
//         ...tsPlugin.configs["recommended"].rules,
//         ...prettierPlugin.configs.recommended.rules,
//         ...eslintConfigPrettier.rules,
//       },
//     },
//   ];


  
  module.exports = config;