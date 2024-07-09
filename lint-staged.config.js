module.exports = {
    // Lint then format TypeScript and JavaScript files
    "(apps|libs)/**/*.(ts|tsx|js)": (_) => [`pnpm lint`, `pnpm format`],
};
