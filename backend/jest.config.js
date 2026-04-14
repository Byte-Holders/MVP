module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts', // i moduli NestJS non contengono logica testabile
    '!main.ts', // entry point
    '!**/*.dto.ts', // i DTO sono solo definizioni di tipo
    '!**/*.schema.ts', // gli schema Mongoose non contengono logica
    '!**/*.entity.ts', // le entity sono solo classi dati
    '!**/*.interface.ts', // le interfacce sono solo tipi
  ],
  coverageDirectory: '../coverage',
  coverageThreshold: { global: { lines: 70 } },
  testEnvironment: 'node',
};