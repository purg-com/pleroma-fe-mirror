import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { readFile } from 'node:fs/promises'
import { build } from 'vite'
import { generateServiceWorkerMessages } from './service_worker_messages.js'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))

export const devSwPlugin = ({
  swSrc,
  swDest,
}) => {
  return {
    name: 'dev-sw-plugin',
    apply: 'serve',
    resolveId (id) {
      const name = id.startsWith('/') ? id.slice(1) : id
      if (name === swDest) {
        return swSrc
      }
      return null
    },
    async load (id) {
      if (id === swSrc) {
        return readFile(swSrc, 'utf-8')
      }
      return null
    },
    /**
     * vite does not bundle the service worker
     * during dev, and firefox does not support ESM as service worker
     * https://bugzilla.mozilla.org/show_bug.cgi?id=1360870
     */
    // async transform (code, id) {
    //   if (id === swSrc) {
    //     console.log('load virtual')
    //     const res = await build({
    //       entryPoints: [swSrc],
    //       bundle: true,
    //       write: false,
    //       outfile: 'sw-pleroma.js',
    //       alias: {
    //         'src': projectRoot + '/src',
    //       },
    //       define: {
    //         'import.meta.glob': 'require'
    //       }
    //     })
    //     console.log('res', res)
    //     const text = res.outputFiles[0].text
    //     console.log('text', text)
    //     return text
    //   }
    // }
  }
}

// Idea taken from
// https://github.com/vite-pwa/vite-plugin-pwa/blob/main/src/plugins/build.ts
// rollup does not support compiling to iife if we want to code-split;
// however, we must compile the service worker to iife because of browser support.
// Run another vite build just for the service worker targeting iife at
// the end of the build.
export const buildSwPlugin = ({
  swSrc,
  swDest,
}) => {
  let config
  return {
    name: 'build-sw-plugin',
    enforce: 'post',
    apply: 'build',
    configResolved (resolvedConfig) {
      config = {
        define: resolvedConfig.define,
        resolve: resolvedConfig.resolve,
        plugins: [swMessagesPlugin()],
        publicDir: false,
        build: {
          ...resolvedConfig.build,
          lib: {
            entry: swSrc,
            formats: ['iife'],
            name: 'sw_pleroma'
          },
          emptyOutDir: false,
          rollupOptions: {
            output: {
              entryFileNames: swDest
            }
          }
        },
        configFile: false
      }
    },
    closeBundle: {
      order: 'post',
      sequential: true,
      async handler () {
        console.log('Building service worker for production')
        await build(config)
      }
    }
  }
}

const swMessagesName = 'virtual:pleroma-fe/service_worker_messages'
const swMessagesNameResolved = '\0' + swMessagesName

export const swMessagesPlugin = () => {
  return {
    name: 'sw-messages-plugin',
    resolveId (id) {
      if (id === swMessagesName) {
        return swMessagesNameResolved
      } else {
        return null
      }
    },
    async load (id) {
      if (id === swMessagesNameResolved) {
        const messages = await generateServiceWorkerMessages()
        return `export default ${JSON.stringify(messages, undefined, 2)}`
      }
      return null
    }
  }
}
