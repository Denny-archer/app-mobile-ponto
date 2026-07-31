module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.ts"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).(ts|tsx)",
    "**/?(*.)+(test|spec).(ts|tsx)",
  ],
  clearMocks: true,
};
