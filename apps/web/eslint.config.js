const coreWebVitals = require('eslint-config-next/core-web-vitals')

module.exports = [
  ...coreWebVitals,
  {
    rules: {
      // React Compiler / RHC rule; valid sync resets in effects still fail — revisit when refactoring modals/checkout.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/components/Legal/**/*.tsx', 'src/components/Main/AVVSection.tsx'],
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]
