const coreWebVitals = require('eslint-config-next/core-web-vitals')

module.exports = [
  ...coreWebVitals,
  {
    files: ['src/components/Legal/**/*.tsx', 'src/components/Main/AVVSection.tsx'],
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]
