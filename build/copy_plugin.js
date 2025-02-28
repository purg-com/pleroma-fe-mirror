import serveStatic from 'serve-static'
import { resolve } from 'node:path'
import { cp } from 'node:fs/promises'

const getPrefix = s => {
  const padEnd = s.endsWith('/') ? s : s + '/'
  return padEnd.startsWith('/') ? padEnd : '/' + padEnd
}

const copyPlugin = ({ inUrl, inFs }) => {
  const prefix = getPrefix(inUrl)
  const subdir = prefix.slice(1)
  let copyTarget
  const handler = serveStatic(inFs)

  return [{
    name: 'copy-plugin-serve',
    apply: 'serve',
    configureServer (server) {
      server.middlewares.use(prefix, handler)
    }
  }, {
    name: 'copy-plugin-build',
    apply: 'build',
    configResolved (config) {
      copyTarget = resolve(config.root, config.build.outDir, subdir)
    },
    closeBundle: {
      order: 'post',
      sequential: true,
      async handler () {
        console.log(`Copying '${inFs}' to ${copyTarget}...`)
        await cp(inFs, copyTarget, { recursive: true })
        console.log('Done.')
      }
    }
  }]
}

export default copyPlugin
