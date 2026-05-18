const STORAGE_KEY = 'talentsphere_custom_filters';

const EMPTY = { location: [], employment: [], skills: [], education: [], jobTitle: [] };

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCustomFilterOptions(userId) {
  if (!userId) return { ...EMPTY };
  const all = loadAll();
  return { ...EMPTY, ...(all[userId] || {}) };
}

export function addCustomFilterOption(userId, type, value) {
  const trimmed = value?.trim();
  if (!userId || !trimmed || !(type in EMPTY)) return false;

  const all = loadAll();
  const userOpts = { ...EMPTY, ...(all[userId] || {}) };
  const list = userOpts[type] || [];
  const key = trimmed.toLowerCase();
  if (list.some((x) => x.toLowerCase() === key)) return false;

  userOpts[type] = [...list, trimmed];
  all[userId] = userOpts;
  saveAll(all);
  return true;
}

export function removeCustomFilterOption(userId, type, value) {
  if (!userId || !(type in EMPTY)) return;

  const all = loadAll();
  const userOpts = { ...EMPTY, ...(all[userId] || {}) };
  userOpts[type] = (userOpts[type] || []).filter((x) => x !== value);
  all[userId] = userOpts;
  saveAll(all);
}

export function mergeFilterOptions(fromJobs, presets, custom) {
  const seen = new Set();
  const result = [];

  const add = (val) => {
    const label = typeof val === 'string' ? val : val.label;
    const id = typeof val === 'string' ? val : val.id;
    const key = id.toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push({ id, label });
  };

  presets.forEach(add);
  fromJobs.forEach(add);
  custom.forEach(add);

  return result;
}
