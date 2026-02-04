const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite database
const dbPath = path.join(dataDir, 'tasks.db');
const db = new Database(dbPath);

// Create tasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    day TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Database initialized at:', dbPath);

// API Routes

// GET all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY position ASC').all();
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET tasks by day
app.get('/api/tasks/day/:day', (req, res) => {
  try {
    const { day } = req.params;
    const tasks = db.prepare('SELECT * FROM tasks WHERE day = ? ORDER BY position ASC').all(day);
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks by day:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Create new task
app.post('/api/tasks', (req, res) => {
  try {
    const { text, day = 'pool', completed = 0, position = 0 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const stmt = db.prepare('INSERT INTO tasks (text, day, completed, position) VALUES (?, ?, ?, ?)');
    const result = stmt.run(text, day, completed, position);
    
    res.status(201).json({
      id: result.lastInsertRowid,
      text,
      day,
      completed,
      position
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { text, day, completed, position } = req.body;
    
    let updates = [];
    let values = [];
    
    if (text !== undefined) {
      updates.push('text = ?');
      values.push(text);
    }
    if (day !== undefined) {
      updates.push('day = ?');
      values.push(day);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      values.push(position);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    
    res.json({ id: parseInt(id), changes: result.changes });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    
    res.json({ id: parseInt(id), changes: result.changes });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Database location: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing database...');
  db.close();
  process.exit(0);
});
