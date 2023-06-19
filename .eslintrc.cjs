module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    radix: [0],
    camelcase: 'off',
    'newline-per-chained-call': [0],
    'max-len': [0],
    'no-use-before-define': ['error', { functions: false }],
    'no-plusplus': [0],
    'no-param-reassign': [0],
    'global-require': [0],
    'no-restricted-syntax': [0],
    'no-await-in-loop': [0],
    'no-underscore-dangle': [0],
    'no-console': [0],
    'default-param-last': [0],
    'class-methods-use-this': [0],
    'no-continue': [0],
    'no-extend-native': [0],
    'import/no-import-module-exports': [0],
    'import/no-dynamic-require': [0],
    'import/prefer-default-export': [0],
  },
};