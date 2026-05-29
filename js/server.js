const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app = express();

app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(__dirname)));

/* ══════════════════════════════════════════════
   STORAGE LAYER
   – Uses MongoDB Atlas when MONGODB_URI is set.
   – Falls back to local JSON files automatically
     (safe for Render free tier / local dev with
      no env var configured).
══════════════════════════════════════════════ */

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME   = 'tisoy_sushi';
const DATA_DIR  = path.join(__dirname, 'data');

// Ensure local data directory exists for file-based fallback
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let db     = null;
let useMongo = false;   // flips to true only after a successful connection

async function tryConnectDB() {
  if (!MONGO_URI) {
    console.log('ℹ️  No MONGODB_URI set — using local JSON file storage.');
    return;
  }
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    useMongo = true;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('⚠️  MongoDB connection failed — falling back to local JSON files.', err.message);
  }
}

/* ── File-based helpers ── */
function filePath(col) {
  return path.join(DATA_DIR, col + '.json');
}

function fileRead(col) {
  try {
    const p = filePath(col);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { return null; }
}

function fileWrite(col, data) {
  fs.writeFileSync(filePath(col), JSON.stringify(data, null, 2), 'utf8');
}

/* ── Unified read/write ── */
async function getDoc(col) {
  if (useMongo) {
    const doc = await db.collection(col).findOne({ _id: 'main' });
    return doc;
  }
  return fileRead(col);
}

async function setDoc(col, data) {
  if (useMongo) {
    await db.collection(col).updateOne(
      { _id: 'main' },
      { $set: { _id: 'main', ...data } },
      { upsert: true }
    );
    return;
  }
  fileWrite(col, { _id: 'main', ...data });
}

/* ── Feedback helpers (multi-doc collection) ── */
function feedbackRead() {
  return fileRead('feedback_docs') || [];
}
function feedbackWrite(docs) {
  fileWrite('feedback_docs', docs);
}

/* ══════════════════════════════════════════════
   API ROUTES
══════════════════════════════════════════════ */

// MENU
app.get('/api/menu', async (req, res) => {
  try {
    const doc = await getDoc('menu');
    if (doc) { const { _id, ...data } = doc; return res.json(data); }
    res.json({});
  } catch (err) {
    console.error('GET /api/menu:', err.message);
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    await setDoc('menu', req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/menu:', err.message);
    res.status(500).json({ error: 'Failed to save menu' });
  }
});

// IMAGES
app.post('/api/image', express.json({ limit: '8mb' }), async (req, res) => {
  try {
    const { data, mimeType } = req.body;
    if (!data) return res.status(400).json({ error: 'No image data' });
    const id = 'img_' + Date.now();

    if (useMongo) {
      await db.collection('images').insertOne({ _id: id, data, mimeType: mimeType || 'image/jpeg', createdAt: new Date() });
    } else {
      // Store each image as its own file so the menu JSON stays small
      const imgDir = path.join(DATA_DIR, 'images');
      if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
      fs.writeFileSync(path.join(imgDir, id + '.json'), JSON.stringify({ data, mimeType: mimeType || 'image/jpeg' }), 'utf8');
    }

    res.json({ id, url: '/api/image/' + id });
  } catch (err) {
    console.error('POST /api/image:', err.message);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

app.get('/api/image/:id', async (req, res) => {
  try {
    let doc;
    if (useMongo) {
      doc = await db.collection('images').findOne({ _id: req.params.id });
    } else {
      const imgFile = path.join(DATA_DIR, 'images', req.params.id + '.json');
      doc = fs.existsSync(imgFile) ? JSON.parse(fs.readFileSync(imgFile, 'utf8')) : null;
    }
    if (!doc) return res.status(404).send('Not found');
    const buf = Buffer.from(doc.data, 'base64');
    res.set('Content-Type', doc.mimeType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(buf);
  } catch (err) {
    console.error('GET /api/image:', err.message);
    res.status(500).send('Error');
  }
});

// SETTINGS
app.get('/api/settings', async (req, res) => {
  try {
    const doc = await getDoc('settings');
    if (doc) { const { _id, ...data } = doc; return res.json(data); }
    res.json({ store_closed: '0', store_message: '' });
  } catch (err) {
    console.error('GET /api/settings:', err.message);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    await setDoc('settings', req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/settings:', err.message);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// FEEDBACK
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    if (!comment || !rating) return res.status(400).json({ error: 'Missing fields' });

    const doc = {
      name: (name || 'Anonymous').slice(0, 60),
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      comment: comment.slice(0, 600),
      featured: false,
      createdAt: new Date().toISOString()
    };

    if (useMongo) {
      const result = await db.collection('feedback').insertOne(doc);
      return res.json({ ok: true, id: result.insertedId });
    }
    const docs = feedbackRead();
    doc._id = 'fb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    docs.unshift(doc);
    feedbackWrite(docs);
    res.json({ ok: true, id: doc._id });
  } catch (err) {
    console.error('POST /api/feedback:', err.message);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

app.get('/api/feedback/all', async (req, res) => {
  try {
    if (useMongo) {
      const docs = await db.collection('feedback').find({}).sort({ createdAt: -1 }).toArray();
      return res.json(docs);
    }
    const docs = feedbackRead().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(docs);
  } catch (err) {
    console.error('GET /api/feedback/all:', err.message);
    res.status(500).json({ error: 'Failed to load feedback' });
  }
});

app.get('/api/feedback/featured', async (req, res) => {
  try {
    if (useMongo) {
      const docs = await db.collection('feedback').find({ featured: true }).sort({ createdAt: -1 }).limit(20).toArray();
      return res.json(docs);
    }
    const docs = feedbackRead().filter(d => d.featured).slice(0, 20);
    res.json(docs);
  } catch (err) {
    console.error('GET /api/feedback/featured:', err.message);
    res.status(500).json({ error: 'Failed to load featured feedback' });
  }
});

app.post('/api/feedback/:id/toggle', async (req, res) => {
  try {
    if (useMongo) {
      const { ObjectId } = require('mongodb');
      const database = db;
      const doc = await database.collection('feedback').findOne({ _id: new ObjectId(req.params.id) });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      const newVal = !doc.featured;
      await database.collection('feedback').updateOne({ _id: doc._id }, { $set: { featured: newVal } });
      return res.json({ ok: true, featured: newVal });
    }
    const docs = feedbackRead();
    const idx = docs.findIndex(d => d._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    docs[idx].featured = !docs[idx].featured;
    feedbackWrite(docs);
    res.json({ ok: true, featured: docs[idx].featured });
  } catch (err) {
    console.error('POST /api/feedback/toggle:', err.message);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

app.delete('/api/feedback/:id', async (req, res) => {
  try {
    if (useMongo) {
      const { ObjectId } = require('mongodb');
      await db.collection('feedback').deleteOne({ _id: new ObjectId(req.params.id) });
      return res.json({ ok: true });
    }
    const docs = feedbackRead().filter(d => d._id !== req.params.id);
    feedbackWrite(docs);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/feedback:', err.message);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ══════════════════════════════════════════════
   STARTUP — connect DB first, then listen
══════════════════════════════════════════════ */
const PORT = process.env.PORT || 3000;

tryConnectDB().then(() => {
  app.listen(PORT, () => console.log(`Tisoy Sushi Maki running on port ${PORT} [storage: ${useMongo ? 'MongoDB' : 'local JSON'}]`));
});
