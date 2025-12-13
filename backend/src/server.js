import Fastify from 'fastify'
import cors from '@fastify/cors'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const app = Fastify({ logger: true })
await app.register(cors, { origin: '*' })

/**
 * ============================
 * EXTRACT — LISTA OPÇÕES REAIS
 * ============================
 */
app.post('/api/extract', async (request, reply) => {
  const { url } = request.body

  if (!url) {
    reply.code(400)
    return { error: 'url é obrigatória' }
  }

  const proc = spawn('yt-dlp', ['-J', url])

  let data = ''
  proc.stdout.on('data', chunk => (data += chunk))

  await new Promise((resolve, reject) => {
    proc.on('error', reject)
    proc.on('close', resolve)
  })

  const json = JSON.parse(data)
  const formats = json.formats || []

  const videoQualities = new Map()

  for (const f of formats) {
    if (
      f.ext === 'mp4' &&
      f.vcodec !== 'none' &&
      f.height
    ) {
      videoQualities.set(f.height, {
        quality: f.height,
        label: `${f.width}x${f.height}`
      })
    }
  }

  const sortedVideo = [...videoQualities.values()]
    .sort((a, b) => b.quality - a.quality)

  return {
    video: sortedVideo,
    audio: true
  }
})

/**
 * ============================
 * DOWNLOAD — BAIXA ESCOLHIDO
 * ============================
 */
app.get('/api/download', async (request, reply) => {
  const { url, type, quality } = request.query

  if (!url || !type) {
    reply.code(400)
    return { error: 'url e type são obrigatórios' }
  }

  const tmpDir = os.tmpdir()
  const id = Date.now()
  const basePath = path.join(tmpDir, `media-${id}`)

  let outputFile
  let args
  let contentType

  if (type === 'mp4') {
    outputFile = `${basePath}.mp4`
    contentType = 'video/mp4'

    const q = quality ? Number(quality) : null

    const format =
      q
        ? `bestvideo[ext=mp4][vcodec=h264][height<=${q}]+bestaudio[ext=m4a][acodec=aac]/best`
        : `bestvideo[ext=mp4][vcodec=h264]+bestaudio[ext=m4a][acodec=aac]/best`

    args = [
      url,
      '-f',
      format,
      '--merge-output-format',
      'mp4',
      '-o',
      outputFile
    ]
  }

  else if (type === 'mp3') {
    outputFile = `${basePath}.mp3`
    contentType = 'audio/mpeg'

    args = [
      url,
      '-x',
      '--audio-format',
      'mp3',
      '--audio-quality',
      '0',
      '-o',
      outputFile
    ]
  }

  else {
    reply.code(400)
    return { error: 'type inválido' }
  }

  const proc = spawn('yt-dlp', args)

  await new Promise((resolve, reject) => {
    proc.on('error', reject)
    proc.on('close', resolve)
  })

  const stat = fs.statSync(outputFile)
  if (!stat || stat.size === 0) {
    reply.code(500)
    return { error: 'Arquivo vazio' }
  }

  reply.raw.writeHead(200, {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${path.basename(outputFile)}"`,
    'Content-Length': stat.size
  })

  const stream = fs.createReadStream(outputFile)
  stream.pipe(reply.raw)

  stream.on('close', () => {
    fs.unlink(outputFile, () => {})
  })

  return reply
})

app.listen({ port: 3333, host: '0.0.0.0' }, () => {
  console.log('Backend running on http://localhost:3333')
})
