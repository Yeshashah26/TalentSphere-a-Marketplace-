import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../data/db.json');

const defaultDb = () => ({
  users: [
    {
      id: 'admin-1',
      email: 'admin@talentsphere.com',
      password: 'admin123',
      role: 'admin',
      name: 'Super Admin',
    },
  ],
  candidates: [],
  companies: [],
  jobs: [],
  applications: [],
  savedJobs: [],
  savedCandidates: [],
  messages: [],
  notifications: [],
});

export function loadDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const db = defaultDb();
      saveDb(db);
      return db;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    const db = defaultDb();
    saveDb(db);
    return db;
  }
}

export function saveDb(db) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
