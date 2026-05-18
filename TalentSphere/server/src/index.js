import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import { runSeed } from './seed.js';

const PORT = process.env.PORT || 3001;

runSeed();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'talentsphere-api' });
});

app.use('/api', routes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TalentSphere API running at http://localhost:${PORT}`);
});
