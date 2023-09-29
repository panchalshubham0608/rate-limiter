// Path: jest.config.ts
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // only test dist/ folder
    testMatch: [
        "**/dist/**/*.test.js"
    ],
};
