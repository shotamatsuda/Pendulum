const restrictedGlobals = require('confusing-browser-globals')
const standard = require('eslint-config-standard')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  extends: ['standard', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-restricted-globals': ['error', ...restrictedGlobals]
  },
  overrides: [
    {
      files: '*.{jsx,tsx}',
      extends: [
        'standard-jsx',
        'standard-react',
        'plugin:react-hooks/recommended',
        'prettier'
      ],
      rules: {
        // Too many false negatives.
        'react/no-unknown-property': 'off'
      }
    },
    {
      files: '*.{ts,tsx}',
      extends: [
        'standard-with-typescript',
        'plugin:react-hooks/recommended',
        'prettier'
      ],
      rules: {
        // Prefer type checking in TypeScript.
        'react/prop-types': 'off',
        // Use underscore for discarding required variables.
        '@typescript-eslint/no-unused-vars': [
          standard.rules['no-unused-vars'][0],
          {
            ...standard.rules['no-unused-vars'][1],
            varsIgnorePattern: '^_$'
          }
        ],
        // It's not harmful.
        '@typescript-eslint/no-empty-interface': 'off',
        // It's not so harmful to cast values to string implicitly, especially
        // inside template strings that we often construct messages from.
        '@typescript-eslint/restrict-template-expressions': 'off'
      }
    }
  ]
}
