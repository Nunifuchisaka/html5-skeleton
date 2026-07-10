const globals = require('globals');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        $: 'readonly',
        jQuery: 'readonly'
      }
    },
    rules: {
      'semi': ['error', 'always'],
      'no-unused-vars': 'warn',
    }
  },
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        $: 'readonly',
        jQuery: 'readonly'
      }
    },
    rules: {
      'semi': ['error', 'always'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
);
