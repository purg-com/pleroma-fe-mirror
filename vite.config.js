import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { VitePWA } from 'vite-plugin-pwa'
import { devSwPlugin, buildSwPlugin, swMessagesPlugin } from './build/sw_plugin.js'

const getLocalDevSettings = async () => {
  try {
    const settings = (await import('./config/local.json')).default
    if (settings.target && settings.target.endsWith('/')) {
      // replacing trailing slash since it can conflict with some apis
      // and that's how actual BE reports its url
      settings.target = settings.target.replace(/\/$/, '')
    }
    console.info('Using local dev server settings (/config/local.json):')
    console.info(JSON.stringify(settings, null, 2))
    return settings
  } catch (e) {
    console.info('Local dev server settings not found (/config/local.json)', e)
    return {}
  }
}

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig(async ({ command }) => {
  const settings = await getLocalDevSettings()
  const target = settings.target || 'http://localhost:4000/'
  const proxy = {
    '/api': {
      target,
      changeOrigin: true,
      cookieDomainRewrite: 'localhost',
      ws: true
    },
    '/nodeinfo': {
      target,
      changeOrigin: true,
      cookieDomainRewrite: 'localhost'
    },
    '/socket': {
      target,
      changeOrigin: true,
      cookieDomainRewrite: 'localhost',
      ws: true,
      headers: {
        'Origin': target
      }
    },
    '/oauth': {
      target,
      changeOrigin: true,
      cookieDomainRewrite: 'localhost'
    }
  }

  const swSrc = 'src/sw.js'
  const swDest = 'sw-pleroma.js'

  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement(tag) {
              if (tag === 'pinch-zoom') {
                return true
              }
              return false
            }
          }
        }
      }),
      vueJsx(),
      devSwPlugin({ swSrc, swDest }),
      buildSwPlugin({ swSrc, swDest }),
      swMessagesPlugin()
    ],
    resolve: {
      alias: {
        src: '/src',
        components: '/src/components'
      }
    },
    define: {
      'process.env': JSON.stringify({
        NODE_ENV: command === 'serve' ? 'development' : 'production',
        HAS_MODULE_SERVICE_WORKER: command === 'serve'
      }),
      'COMMIT_HASH': JSON.stringify('DEV'),
      'DEV_OVERRIDES': JSON.stringify({})
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          main: 'index.html'
        },
        output: {
          inlineDynamicImports: false,
          entryFileNames (chunkInfo) {
            const id = chunkInfo.facadeModuleId
            if (id.endsWith(swSrc)) {
              return swDest
            } else {
              return 'static/js/[name].[hash].js'
            }
          },
          chunkFileNames (chunkInfo) {
            return 'static/js/[name].[hash].js'
          },
          assetFileNames (assetInfo) {
            const name = assetInfo.names?.[0] || ''
            if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(name)) {
              return 'static/img/[name].[hash][extname]'
            } else if (/\.css$/.test(name)) {
              return 'static/css/[name].[hash][extname]'
            } else {
              return 'static/misc/[name].[hash][extname]'
            }
          }
        }
      },
    },
    server: {
      proxy,
      port: Number(process.env.PORT) || 8080
    },
    preview: {
      proxy
    }
  }
})
