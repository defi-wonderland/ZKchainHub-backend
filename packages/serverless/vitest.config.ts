import { baseConfig } from '@hyperhub/test-config'
import { mergeConfig, defineConfig } from 'vitest/config'

console.log('BASE CONFIG', baseConfig);

export default mergeConfig(baseConfig, defineConfig({
  test: {
    exclude: ['coverage/*'],
  },
}))