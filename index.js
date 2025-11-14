const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'concho-fire-2025-secret';

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// In-memory DB (demo only)
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT)");
  const hash = bcrypt.hashSync('blaze123', 10);
  db.run("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", ['chief@conchofire.org', hash, 'Chief Blaze']);
});

app.get('/', (req, res) => res.send('🔥 Concho API Live!'));

app.post('/auth', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Bad creds, hero!' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, message: 'Logged in! 🚒', redirect: '/dashboard' });
  });
});

app.post('/forgot', (req, res) => {
  const { email } = req.body;
  res.json({ message: `Reset link sent to ${email} (fake for now)` });
});

app.listen(PORT, () => console.log(`API blazing on ${PORT}`));
