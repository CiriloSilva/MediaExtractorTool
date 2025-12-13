import Fastify from 'fastify'
import cors from '@fastify/cors'
import extractRoute from './routes/extract.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS']
})

app.register(extractRoute, { prefix: '/api' })

export default app
