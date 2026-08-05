module.exports = {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  // Runs before any test module is imported, so hermetic env vars are in place
  // before src/config/index.ts calls dotenv.config().
  setupFiles: ["<rootDir>/tests/setup/testEnv.ts"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  moduleNameMapper: {
    // Sources import with .ts extensions, but ts-jest honors
    // rewriteRelativeImportExtensions and emits .js specifiers, which do not
    // exist on disk. Map them back to the source file for resolution.
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
