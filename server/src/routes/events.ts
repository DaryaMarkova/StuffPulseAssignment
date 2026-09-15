import { Router } from 'express'
import { addSseClient, removeSseClient } from '../realtime.js'

export const eventsRouter = Router()

eventsRouter.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  res.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`)

  const clientId = addSseClient(res)

  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`)
  }, 15_000)
  heartbeat.unref?.()

  req.on('close', () => {
    clearInterval(heartbeat)
    removeSseClient(clientId)
  })
})
