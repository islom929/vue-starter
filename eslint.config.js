import tsPlug from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import sisPlug from 'eslint-plugin-simple-import-sort'
import vuePlug from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  ...vuePlug.configs['flat/strongly-recommended'],
  {
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        parser: tsParser,
      },
    },
    files: [
      'src/**/*.{vue,js,ts,tsx,json}',
      'vite.config.{js,ts}',
      'eslint.config.js',
      'tests/**/*.{js,ts}',
    ],
    plugins: {
      ts: tsPlug,
      vue: vuePlug,
      prettier,
      'simple-import-sort': sisPlug,
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
      quotes: ['warn', 'single'],
      semi: ['warn', 'never'],
      'no-undef': 'off',
      'simple-import-sort/imports': 'error', // Removed duplicate
      'simple-import-sort/exports': 'error', // Removed duplicate
      'ts/no-unused-vars': 'warn',
      'ts/no-explicit-any': 'warn',
      'prettier/prettier': 'warn',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': ['warn', { singleline: 3 }], // Adjusted for large projects
      'vue/html-self-closing': 'off', // Allow flexibility in large projects
    },
  },
]
