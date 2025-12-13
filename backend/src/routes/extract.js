import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

export default async function extractRoutes(app) {

  // =========================
  // EXTRACT INFO
  // =========================
  app.post('/extract', async (req, reply) => {
    const { url } = req.body

    if (!url) {
      return reply.code(400).send({ error: 'URL obrigatória' })
    }

    return new Promise((resolve) => {
      const ytdlp = spawn('yt-dlp', ['-J', url])

      let data = ''

      ytdlp.stdout.on('data', d => data += d.toString())
      ytdlp.stderr.on('data', () => {})

      ytdlp.on('close', () => {
        try {
          const json = JSON.parse(data)

          const formats = json.formats.map(f => ({
            format_id: f.format_id,
            ext: f.ext,
            resolution: f.height ? `${f.width}x${f.height}` : 'audio',
            vcodec: f.vcodec,
            acodec: f.acodec
          }))

          reply.send({ title: json.title, formats })
          resolve()
        } catch {
          reply.code(500).send({ error: 'Falha ao extrair dados' })
          resolve()
        }
      })
    })
  })

  // =========================
  // DOWNLOAD
  // =========================
  app.get('/download', async (req, reply) => {
    const { url, type } = req.query

    if (!url || !type) {
      return reply.code(400).send({ error: 'URL e type obrigatórios' })
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'media-'))
    const output =
      type === 'mp3'
        ? path.join(tempDir, 'audio.mp3')
        : path.join(tempDir, 'video.mp4')

    const args =
      type === 'mp3'
        ? [
            '-x',
            '--audio-format', 'mp3',
            '--audio-quality', '0',
            '-o', output,
            url
          ]
        : [
            '-f', 'bv*[vcodec^=avc1]+ba[acodec^=mp4a]/b[ext=mp4]',
            '--merge-output-format', 'mp4',
            '-o', output,
            url
          ]

    const ytdlp = spawn('yt-dlp', args)

    ytdlp.stderr.on('data', d => console.log(d.toString()))

    ytdlp.on('close', (code) => {
      if (code !== 0 || !fs.existsSync(output)) {
        return reply.code(500).send({ error: 'Erro ao gerar arquivo' })
      }

      reply.header(
        'Content-Disposition',
        `attachment; filename="${path.basename(output)}"`
      )

      const stream = fs.createReadStream(output)
      stream.pipe(reply.raw)

      stream.on('close', () => {
        fs.rmSync(tempDir, { recursive: true, force: true })
      })
    })
  })
}
