/** @deprecated Data is stored on the Node.js API server. See /server */
export function loadDb() {
  console.warn('loadDb() is deprecated. Use API calls from lib/api.js');
  return { users: [], candidates: [], companies: [], jobs: [], applications: [], savedJobs: [], savedCandidates: [], messages: [], notifications: [] };
}

export function saveDb() {
  console.warn('saveDb() is deprecated.');
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
