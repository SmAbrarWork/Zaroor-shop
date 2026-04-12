import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dist = path.join(root, 'dist')
const src = path.join(root, 'src')

fs.rmSync(dist, { recursive: true, force: true })
fs.mkdirSync(dist, { recursive: true })
fs.cpSync(src, path.join(dist, 'src'), { recursive: true })
console.log('build: copied src -> dist/src (Vercel Express entrypoint scan)')
