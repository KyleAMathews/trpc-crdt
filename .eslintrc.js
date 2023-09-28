module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    `eslint:recommended`,
    `plugin:@typescript-eslint/recommended`,
    `plugin:react/recommended`,
    `plugin:prettier/recommended`,
  ],
  parserOptions: {
    ecmaVersion: 2022,
    requireConfigFile: false,
    sourceType: `module`,
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: `detect`,
    },
  },
  parser: '@typescript-eslint/parser',
  plugins: [`react`, `prettier`],
  rules: {
    quotes: [`error`, `backtick`],
  },
}
