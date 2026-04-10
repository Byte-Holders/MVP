import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',

  // Cerca solo i file di integrazione
  testMatch: ['<rootDir>/test/integration/**/*.int-spec.ts'],

  testEnvironment: 'node',

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // I test di integrazione con MongoDB in-memory possono essere lenti
  testTimeout: 20000,

  // Coverage solo per i test di integrazione
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['node_modules', '\\.module\\.ts$', 'main\\.ts$'],
};

export default config;
