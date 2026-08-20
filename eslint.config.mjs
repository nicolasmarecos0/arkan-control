import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

export default tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**', 'drizzle/**', 'coverage/**', 'next-env.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextCoreWebVitals,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // The domain layer must stay pure: no persistence, no framework, no I/O.
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/infrastructure/*',
                '@/application/*',
                '@/app/*',
                'drizzle-orm*',
                'pg',
                'next*',
                'react*',
              ],
              message:
                'src/domain must not depend on application, infrastructure or framework code.',
            },
          ],
        },
      ],
    },
  },
  {
    // Use cases depend on ports, never on a concrete driver.
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/infrastructure/*', 'drizzle-orm*', 'pg', 'next*', 'react*'],
              message: 'src/application must depend on ports, not on infrastructure.',
            },
          ],
        },
      ],
    },
  },
)
