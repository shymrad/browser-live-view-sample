import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const dcvSdkDir = resolve(
  __dirname,
  'node_modules/bedrock-agentcore/dist/src/tools/browser/live-view/nice-dcv-web-client-sdk'
)

export default defineConfig({
  resolve: {
    alias: {
      dcv: resolve(dcvSdkDir, 'dcvjs-esm/dcv.js'),
      'dcv-ui': resolve(dcvSdkDir, 'dcv-ui/dcv-ui.js'),
    },
    // Force all shared deps to resolve from this project's node_modules,
    // not from the symlinked SDK path where the vendored DCV SDK lives.
    dedupe: [
      'react',
      'react-dom',
      'prop-types',
      '@cloudscape-design/components',
      '@cloudscape-design/global-styles',
      '@cloudscape-design/design-tokens',
      '@babel/runtime',
    ],
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: resolve(dcvSdkDir, 'dcvjs-esm'), dest: 'nice-dcv-web-client-sdk' },
        { src: resolve(dcvSdkDir, 'dcv-ui'), dest: 'nice-dcv-web-client-sdk' },
      ],
    }),
  ],
})
