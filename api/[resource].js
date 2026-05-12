const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'db.json');

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { users: [], tickets: [], airTickets: [], airTicketBookings: [], bookings: [] };
  }
}

function writeDb(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

function getResourceKey(resource) {
  const allowed = [
    'users',
    'tickets',
    'airTickets',
    'airTicketBookings',
    'bookings',
  ];
  return allowed.includes(resource) ? resource : null;
}

function filterItems(items, query) {
  return Object.entries(query).reduce((result, [key, value]) => {
    if (value === undefined || value === '') return result;
    return result.filter((item) => {
      const field = item[key];
      if (Array.isArray(field)) {
        return field.includes(value);
      }
      if (field === null || field === undefined) {
        return false;
      }
      return String(field).toLowerCase() === String(value).toLowerCase();
    });
  }, items);
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const resource = req.query.resource;
  const key = getResourceKey(resource);

  if (!key) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const db = readDb();
  const items = db[key] || [];

  if (req.method === 'GET') {
    const filtered = filterItems(items, req.query);
    return res.status(200).json(filtered);
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    const created = { ...payload, id: nextId(items) };
    db[key] = [...items, created];
    writeDb(db);
    return res.status(201).json(created);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};