const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Create tasks table if it doesn't exist
function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      day TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Tasks table ready');
    }
  });
}

// API Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY position ASC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get tasks by day
app.get('/api/tasks/day/:day', (req, res) => {
  const { day } = req.params;
  db.all('SELECT * FROM tasks WHERE day = ? ORDER BY position ASC', [day], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const { text, day = 'pool', completed = 0, position = 0 } = req.body;
  
  if (!text) {
    res.status(400).json({ error: 'Task text is required' });
    return;
  }

  db.run(
    'INSERT INTO tasks (text, day, completed, position) VALUES (?, ?, ?, ?)',
    [text, day, completed, position],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        text,
        day,
        completed,
        position
      });
    }
  );
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
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
  
  values.push(id);
  
  db.run(
    `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: parseInt(id), changes: this.changes });
    }
  );
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: parseInt(id), changes: this.changes });
  });
});

// Delete all completed tasks
app.delete('/api/tasks/completed/all', (req, res) => {
  db.run('DELETE FROM tasks WHERE completed = 1', [], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
