module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@root/(.*)$': '<rootDir>/$1',
    '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@socket/(.*)$': '<rootDir>/src/socket/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
}; 