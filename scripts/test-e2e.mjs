import { spawn } from 'node:child_process'
import { closeStaticServer, server } from './serve-static.mjs'

await new Promise((resolveListen, rejectListen) => {
  if (server.listening) resolveListen()
  else {
    server.once('listening', resolveListen)
    server.once('error', rejectListen)
  }
})

const playwright = spawn(
  process.execPath,
  ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)],
  {
    env: { ...process.env, PLAYWRIGHT_SERVER_RUNNING: 'true' },
    stdio: 'inherit',
  },
)

const exitCode = await new Promise((resolveExit, rejectExit) => {
  playwright.once('error', rejectExit)
  playwright.once('exit', code => resolveExit(code ?? 1))
})

await closeStaticServer()
process.exit(exitCode)
