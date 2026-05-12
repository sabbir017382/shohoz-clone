const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(process.cwd(), "db.json");

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading db.json:", error);
    return {
      users: [],
      tickets: [],
      airTickets: [],
      airTicketBookings: [],
      bookings: [],
    };
  }
}

function writeDb(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Error writing db.json:", error);
  }
}

function getResourceKey(resource) {
  const allowed = [
    "users",
    "tickets",
    "airTickets",
    "airTicketBookings",
    "bookings",
  ];
  return allowed.includes(resource) ? resource : null;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const resource = req.query.resource;
  const id = Number(req.query.id);
  const key = getResourceKey(resource);

  if (!key) {
    return res.status(404).json({ error: "Resource not found" });
  }

  const db = readDb();
  const items = db[key] || [];
  const index = items.findIndex((item) => Number(item.id) === id);

  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }

  if (req.method === "GET") {
    return res.status(200).json(items[index]);
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const payload = req.body || {};
    const updated = { ...items[index], ...payload, id };
    items[index] = updated;
    db[key] = items;
    writeDb(db);
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    db[key] = items.filter((item) => Number(item.id) !== id);
    writeDb(db);
    return res.status(204).send("");
  }

  return res.status(405).json({ error: "Method not allowed" });
};
