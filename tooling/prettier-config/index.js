/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  arrowParens: 'avoid',
};
