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
    // Remap .js imports back to .ts source files for Jest resolution
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
