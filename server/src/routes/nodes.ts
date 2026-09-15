import { Router } from 'express'
import { store } from '../store.js'

export const nodesRouter = Router()

nodesRouter.get('/', (_req, res) => {
  res.json({ nodes: store.getAll() })
})

nodesRouter.get('/:id', (req, res) => {
  const node = store.getById(req.params.id)
  if (!node) {
    res.status(404).json({ error: 'Node not found' })
    return
  }
  res.json(node)
})
