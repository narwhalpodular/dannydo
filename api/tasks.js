// Vercel Serverless Function for Tasks API
// This uses in-memory storage that persists via Vercel KV (optional upgrade)

let tasksStore = [];

// Helper to get next ID
function getNextId() {
  return tasksStore.length > 0 ? Math.max(...tasksStore.map(t => t.id)) + 1 : 1;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query, body } = req;
  const { id, day } = query;

  try {
    // GET all tasks
    if (method === 'GET' && !id && !day) {
      return res.status(200).json(tasksStore);
    }

    // GET tasks by day
    if (method === 'GET' && day) {
      const filtered = tasksStore.filter(t => t.day === day);
      return res.status(200).json(filtered);
    }

    // POST - Create new task
    if (method === 'POST') {
      const { text, day = 'pool', completed = 0, position = 0 } = body;
      
      if (!text) {
        return res.status(400).json({ error: 'Task text is required' });
      }

      const newTask = {
        id: getNextId(),
        text,
        day,
        completed,
        position,
        created_at: new Date().toISOString()
      };

      tasksStore.push(newTask);
      return res.status(201).json(newTask);
    }

    // PUT - Update task
    if (method === 'PUT' && id) {
      const taskId = parseInt(id);
      const taskIndex = tasksStore.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const { text, day, completed, position } = body;
      const task = tasksStore[taskIndex];

      if (text !== undefined) task.text = text;
      if (day !== undefined) task.day = day;
      if (completed !== undefined) task.completed = completed;
      if (position !== undefined) task.position = position;

      tasksStore[taskIndex] = task;
      return res.status(200).json({ id: taskId, changes: 1 });
    }

    // DELETE - Delete task
    if (method === 'DELETE' && id) {
      const taskId = parseInt(id);
      const initialLength = tasksStore.length;
      tasksStore = tasksStore.filter(t => t.id !== taskId);
      
      if (tasksStore.length === initialLength) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.status(200).json({ id: taskId, changes: 1 });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
