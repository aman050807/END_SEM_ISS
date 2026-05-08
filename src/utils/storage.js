export function saveWithTTL(key, data, ttlMinutes = 15) {
  const item = { data, expiry: Date.now() + ttlMinutes * 60 * 1000 };
  localStorage.setItem(key, JSON.stringify(item));
}

export function loadWithTTL(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

export function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function remove(key) {
  localStorage.removeItem(key);
}
