const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();

// Default body limit — keep small so menu JSON stays lean
app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(__dirname)));

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME   = 'tisoy_sushi';
let db;

async function connectDB() {
  if (db) return db;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB Atlas');
  return db;
}

async function getDoc(col) {
  const database = await connectDB();
  return database.collection(col).findOne({ _id: 'main' });
}

async function setDoc(col, data) {
  const database = await connectDB();
  await database.collection(col).updateOne(
    { _id: 'main' },
    { $set: { _id: 'main', ...data } },
    { upsert: true }
  );
}

// MENU
app.get('/api/menu', async (req, res) => {
  try {
    const doc = await getDoc('menu');
    if (doc) { const { _id, ...data } = doc; res.json(data); }
    else res.json({});
  } catch (err) {
    console.error('GET /api/menu:', err);
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    await setDoc('menu', req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/menu:', err);
    res.status(500).json({ error: 'Failed to save menu' });
  }
});

// IMAGES — stored separately in MongoDB so menu stays small
// POST: receive base64, store in images collection, return URL
app.post('/api/image', express.json({ limit: '8mb' }), async (req, res) => {
  try {
    const { data, mimeType } = req.body;
    if (!data) return res.status(400).json({ error: 'No image data' });
    const id = 'img_' + Date.now();
    const database = await connectDB();
    await database.collection('images').insertOne({
      _id: id,
      data,
      mimeType: mimeType || 'image/jpeg',
      createdAt: new Date()
    });
    res.json({ id, url: '/api/image/' + id });
  } catch (err) {
    console.error('POST /api/image:', err);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// GET: serve the stored image as binary
app.get('/api/image/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const doc = await database.collection('images').findOne({ _id: req.params.id });
    if (!doc) return res.status(404).send('Not found');
    const buf = Buffer.from(doc.data, 'base64');
    res.set('Content-Type', doc.mimeType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(buf);
  } catch (err) {
    console.error('GET /api/image:', err);
    res.status(500).send('Error');
  }
});

// SETTINGS
app.get('/api/settings', async (req, res) => {
  try {
    const doc = await getDoc('settings');
    if (doc) { const { _id, ...data } = doc; res.json(data); }
    else res.json({ store_closed: '0', store_message: '' });
  } catch (err) {
    console.error('GET /api/settings:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    await setDoc('settings', req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/settings:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// FEEDBACK
// Submit new feedback (public)
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    if (!comment || !rating) return res.status(400).json({ error: 'Missing fields' });
    const database = await connectDB();
    const doc = {
      name: (name || 'Anonymous').slice(0, 60),
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      comment: comment.slice(0, 600),
      featured: false,
      createdAt: new Date()
    };
    const result = await database.collection('feedback').insertOne(doc);
    res.json({ ok: true, id: result.insertedId });
  } catch (err) {
    console.error('POST /api/feedback:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// Get all feedback (admin)
app.get('/api/feedback/all', async (req, res) => {
  try {
    const database = await connectDB();
    const docs = await database.collection('feedback').find({}).sort({ createdAt: -1 }).toArray();
    res.json(docs);
  } catch (err) {
    console.error('GET /api/feedback/all:', err);
    res.status(500).json({ error: 'Failed to load feedback' });
  }
});

// Get featured feedback (public strip)
app.get('/api/feedback/featured', async (req, res) => {
  try {
    const database = await connectDB();
    const docs = await database.collection('feedback').find({ featured: true }).sort({ createdAt: -1 }).limit(20).toArray();
    res.json(docs);
  } catch (err) {
    console.error('GET /api/feedback/featured:', err);
    res.status(500).json({ error: 'Failed to load featured feedback' });
  }
});

// Toggle featured status (admin)
app.post('/api/feedback/:id/toggle', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const database = await connectDB();
    const doc = await database.collection('feedback').findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const newVal = !doc.featured;
    await database.collection('feedback').updateOne({ _id: doc._id }, { $set: { featured: newVal } });
    res.json({ ok: true, featured: newVal });
  } catch (err) {
    console.error('POST /api/feedback/toggle:', err);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// Delete feedback (admin)
app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const database = await connectDB();
    await database.collection('feedback').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/feedback:', err);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Tisoy Sushi Maki on port ' + PORT));
