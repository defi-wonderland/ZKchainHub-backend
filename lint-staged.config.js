module.exports = {
  // Lint then format TypeScript and JavaScript files
  '(apps|libs)/**/*.(ts|tsx|js)': (filenames) => [`pnpm lint`, `pnpm format`],
};
