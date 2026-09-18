import cors from 'cors';
import express from 'express';
import { LOG_MESSAGES } from '@/constants/messages.js';
import { eventsRouter } from '@/controllers/events.js';
import { nodesRouter } from '@/controllers/nodes.js';
import { realtimeService } from '@/services/realtime.service.js';

const PORT = Number(process.env.PORT) || 3001;
const MUTATION_INTERVAL_MS = Number(process.env.MUTATION_INTERVAL_MS) || 4_000;

const app = express();

app.use(
  cors({
    origin: true,
  }),
);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/nodes', nodesRouter);
app.use('/api/events', eventsRouter);

app.listen(PORT, () => {
  realtimeService.startMutations(MUTATION_INTERVAL_MS);
  console.log(LOG_MESSAGES.apiListening(PORT));
});
