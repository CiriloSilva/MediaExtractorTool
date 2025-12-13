import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export default async function downloadRoutes(fastify) {
  fastify.get('/api/download', async (request, reply) => {
    const { url, type } = request.query

    if (!url || !type) {
      reply.code(400)
      return { error: 'url e type são obrigatórios' }
    }

    const tmpDir = os.tmpdir()
    const id = Date.now()
    const basePath = path.join(tmpDir, `media-${id}`)

    let args = []
    let outputFile = ''
    let contentType = ''

    if (type === 'mp4') {
      outputFile = `${basePath}.mp4`
      contentType = 'video/mp4'

      args = [
        url,
        '-f',
        'bv*[vcodec=h264]+ba[acodec=aac]/bv*+ba/b',
        '--merge-output-format',
        'mp4',
        '--recode-video',
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
      return { error: 'type inválido (use mp4 ou mp3)' }
    }

    return new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', args)

      ytdlp.stderr.on('data', () => {}) // silenciado de propósito

      ytdlp.on('error', err => {
        reject(err)
      })

      ytdlp.on('close', code => {
        if (code !== 0 || !fs.existsSync(outputFile)) {
          reply.code(500)
          resolve({ error: 'Falha ao gerar mídia' })
          return
        }

        reply.header('Content-Type', contentType)
        reply.header(
          'Content-Disposition',
          `attachment; filename="${path.basename(outputFile)}"`
        )

        const stream = fs.createReadStream(outputFile)

        stream.on('close', () => {
          fs.unlink(outputFile, () => {})
        })

        reply.send(stream)
        resolve()
      })
    })
  })
}
