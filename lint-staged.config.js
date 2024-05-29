module.exports = {
    // Lint then format TypeScript and JavaScript files
    "(packages)/**/*.(ts|tsx|js)": (filenames) => [`npx eslint --fix`, `yarn format`],
};
