const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');
const { Config } = require('jest');
const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  dir: './',
});

const config: typeof Config = {
  rootDir: process.cwd(),
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  transform: {
    '.*\\.(tsx?|jsx?)$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/types',
    '<rootDir>/src/constants',
    '<rootDir>/src/hooks/data',
    '<rootDir>/src/app/actions.ts',
  ],
  coverageDirectory: './coverage/',
  coverageReporters: ['text-summary', 'html'],
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },
};

export default createJestConfig(config);
