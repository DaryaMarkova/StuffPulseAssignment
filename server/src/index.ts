import cors from 'cors'
import express from 'express'
import { startRealtimeMutations } from './realtime.js'
import { eventsRouter } from './routes/events.js'
import { nodesRouter } from './routes/nodes.js'

const PORT = Number(process.env.PORT) || 3001

const app = express()

app.use(
  cors({
    origin: true,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/nodes', nodesRouter)
app.use('/api/events', eventsRouter)

app.listen(PORT, () => {
  startRealtimeMutations()
  console.log(`StuffPulse API listening on http://localhost:${PORT}`)
})
