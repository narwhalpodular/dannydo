const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize PostgreSQL connection
// Railway automatically provides DATABASE_URL when you add PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Create tasks table on startup
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        day TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('? Database initialized successfully');
  } catch (error) {
    console.error('? Error initializing database:', error);
  }
}

initDatabase();

// API Routes

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY position ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET tasks by day
app.get('/api/tasks/day/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE day = $1 ORDER BY position ASC', [day]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting tasks by day:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { text, day = 'pool', completed = 0, position = 0 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (text, day, completed, position) VALUES ($1, $2, $3, $4) RETURNING *',
      [text, day, completed, position]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, day, completed, position } = req.body;
    
    let updates = [];
    let values = [];
    let valueIndex = 1;
    
    if (text !== undefined) {
      updates.push(`text = $${valueIndex++}`);
      values.push(text);
    }
    if (day !== undefined) {
      updates.push(`day = $${valueIndex++}`);
      values.push(day);
    }
    if (completed !== undefined) {
      updates.push(`completed = $${valueIndex++}`);
      values.push(completed);
    }
    if (position !== undefined) {
      updates.push(`position = $${valueIndex++}`);
      values.push(position);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const result = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ id: parseInt(id), deleted: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`? Server running on http://0.0.0.0:${PORT}`);
  console.log(`?? Database: PostgreSQL (${process.env.DATABASE_URL ? 'connected' : 'waiting for DATABASE_URL'})`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database pool...');
  await pool.end();
  process.exit(0);
});