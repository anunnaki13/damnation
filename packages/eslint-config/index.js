module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'off',
  },
  env: {
    node: true,
    es2021: true,
  },
};
