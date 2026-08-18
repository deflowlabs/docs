import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, relative, resolve, sep } from 'node:path'

const root = resolve('.output/public')
const port = Number.parseInt(process.env.PORT || '4173', 10)
const parentPid = process.ppid

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  // WebAssembly streaming compilation requires this exact media type. Using
  // application/octet-stream forces browsers to log an error and fall back to
  // slower ArrayBuffer instantiation for Nuxt Content's SQLite runtime.
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
}

async function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname).replace(/^[/\\]+/, '')
  let candidate = resolve(root, decoded)
  const insideRoot = relative(root, candidate)

  if (insideRoot.startsWith(`..${sep}`) || insideRoot === '..') return null

  try {
    const details = await stat(candidate)
    if (details.isDirectory()) candidate = join(candidate, 'index.html')
    await stat(candidate)
    return candidate
  } catch {
    return null
  }
}

export const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url || '/', 'http://127.0.0.1').pathname
    const file = await resolveFile(pathname) || join(root, '404.html')
    const status = file.endsWith(`${sep}404.html`) ? 404 : 200
    const details = await stat(file)

    response.writeHead(status, {
      'Content-Length': details.size,
      'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
    })

    if (request.method === 'HEAD') response.end()
    else createReadStream(file).pipe(response)
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Static preview failed.')
  }
})

let shuttingDown = false

export function closeStaticServer() {
  if (shuttingDown) return Promise.resolve()
  shuttingDown = true
  return new Promise((resolveClose) => {
    server.close(resolveClose)
    server.closeAllConnections()
  })
}

function shutdown() {
  void closeStaticServer().finally(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// On Windows, Playwright terminates the command shell first. Exit when that
// parent is gone so local test runs do not leave the static server behind.
const parentWatch = setInterval(() => {
  try {
    process.kill(parentPid, 0)
  } catch {
    clearInterval(parentWatch)
    shutdown()
  }
}, 500)
parentWatch.unref()

server.listen(port, '127.0.0.1', () => {
  console.log(`Static documentation preview: http://127.0.0.1:${port}`)
})
