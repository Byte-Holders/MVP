import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],

  // rootDir punta alla root del progetto (un livello sopra /test)
  rootDir: '..',

  // Cerca solo i file e2e dentro test/e2e/
  testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],

  testEnvironment: 'node',

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  // Alias dei moduli (deve corrispondere a tsconfig.json)
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // Timeout più alto per test che avviano l'app completa
  testTimeout: 30000,

  // File eseguito prima di ogni suite e2e, per aggiungerle vanno creati file backend/test/setup/global-setup.ts (avvio container docker prima di tutti i test e2e) e // backend/test/setup/global-teardown.ts (fermare il container dopo i test e2e)
  /*globalSetup: './test/setup/global-setup.ts',
  globalTeardown: './test/setup/global-teardown.ts',*/
};

export default config;
