import { config as defaultConfig } from '@gluestack-ui/config';
import { createConfig } from '@gluestack-ui/themed';

const customConfig = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      primary500: '#845ef7',
      white: '#FFFFFF',
      black: '#000000',
    },
  },
};

export const config = createConfig(customConfig);
