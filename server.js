// ══════════════════════════════════════
//  server.js — Tisoy Sushi Maki
//  Serves static files + persists menu
//  and store settings to MongoDB Atlas
// ══════════════════════════════════════

const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── MongoDB Setup ─────────────────────────────────────────────
// Paste your Atlas connection string in Render's environment
// variables as:  MONGODB_URI=mongodb+srv://...
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME   = 'tisoy_sushi';

let db;

async function connectDB() {
  if (db) return db;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('✅ Connected to MongoDB Atlas');
  return db;
}

// ── Helper: get a single-doc collection ──────────────────────
// We store everything as one document per collection
// using a fixed _id of 'main' for easy upsert.
async function getDoc(collectionName) {
  const database = await connectDB();
  return database.collection(collectionName).findOne({ _id: 'main' });
}

async function setDoc(collectionName, data) {
  const database = await connectDB();
  await database.collection(collectionName).updateOne(
    { _id: 'main' },
    { $set: { _id: 'main', ...data } },
    { upsert: true }
  );
}

// ══════════════════════════════════════
//  MENU  /api/menu
// ══════════════════════════════════════

// GET — load saved menu (admin.js calls this on init)
app.get('/api/menu', async (req, res) => {
  try {
    const doc = await getDoc('menu');
    if (doc) {
      const { _id, ...menuData } = doc;  // strip MongoDB's _id before sending
      res.json(menuData);
    } else {
      res.json({});  // no saved menu yet — admin.js falls back to data.js
    }
  } catch (err) {
    console.error('GET /api/menu error:', err);
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

// POST — save edited menu from admin panel
app.post('/api/menu', async (req, res) => {
  try {
    await setDoc('menu', req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/menu error:', err);
    res.status(500).json({ error: 'Failed to save menu' });
  }
});

// ══════════════════════════════════════
//  SETTINGS  /api/settings
//  (store open/closed + custom message)
// ══════════════════════════════════════

// GET — load store status (call this in store.js / checkStoreStatus)
app.get('/api/settings', async (req, res) => {
  try {
    const doc = await getDoc('settings');
    if (doc) {
      const { _id, ...settings } = doc;
      res.json(settings);
    } else {
      res.json({ store_closed: '0', store_message: '' });
    }
  } catch (err) {
    console.error('GET /api/settings error:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// POST — save store status from admin panel
app.post('/api/settings', async (req, res) => {
  try {
    await setDoc('settings', req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/settings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ── Catch-all: serve index.html for any unknown route ─────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🍣 Tisoy Sushi Maki running on port ${PORT}`);
});
