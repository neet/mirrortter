
module.exports = {
  rootDir: '.',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/src/**/?(*.)+(spec|test).ts?(x)',
  ],
  testEnvironment: 'node',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
  ],
  coverageDirectory: '<rootDir>/coverage',
}
