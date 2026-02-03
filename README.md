# Weekly Task Manager - Full Stack

A drag-and-drop task manager with SQLite database backend.

## Features

- 7 day columns (Monday-Sunday)
- Task pool for unscheduled tasks
- Drag and drop tasks between days
- Mark tasks as complete
- Recycle tasks back to pool
- SQLite database for data persistence
- RESTful API

## Project Structure

```
task-manager-fullstack/
├── server.js           # Node.js backend server
├── package.json        # Dependencies
├── tasks.db           # SQLite database (created automatically)
├── public/
│   ├── index.html     # Frontend HTML
│   ├── styles.css     # Styles
│   └── app.js         # Frontend JavaScript
└── README.md
```

## Local Setup

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Version 14 or higher recommended

2. **Install Dependencies**
   ```bash
   cd task-manager-fullstack
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to http://localhost:3000

## Database

The app uses SQLite with the following schema:

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  day TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Manual Database Access

You can manually edit the database using:

**Option 1: SQLite Command Line**
```bash
sqlite3 tasks.db
```

Common commands:
```sql
-- View all tasks
SELECT * FROM tasks;

-- Add a task manually
INSERT INTO tasks (text, day, completed) VALUES ('My Task', 'monday', 0);

-- Update a task
UPDATE tasks SET day = 'tuesday' WHERE id = 1;

-- Delete a task
DELETE FROM tasks WHERE id = 1;

-- Delete all completed tasks
DELETE FROM tasks WHERE completed = 1;

-- Exit
.quit
```

**Option 2: DB Browser for SQLite (GUI)**
- Download from https://sqlitebrowser.org/
- Open the `tasks.db` file
- Browse, edit, and query data visually

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/day/:day | Get tasks for specific day |
| POST | /api/tasks | Create new task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| DELETE | /api/tasks/completed/all | Delete all completed tasks |

### Example API Usage

**Create a task:**
```javascript
fetch('http://localhost:3000/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'My new task',
    day: 'monday',
    completed: 0
  })
})
```

**Update a task:**
```javascript
fetch('http://localhost:3000/api/tasks/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    day: 'tuesday'
  })
})
```

## Deployment Options

### Option 1: VPS (DigitalOcean, Linode, AWS EC2)

1. Upload files to server
2. Install Node.js on server
3. Run `npm install`
4. Use PM2 to keep app running:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save
   ```

### Option 2: Railway.app (Easiest)

1. Sign up at https://railway.app/
2. Click "New Project" → "Deploy from GitHub"
3. Connect your repository
4. Railway will auto-detect Node.js and deploy
5. Free tier available

### Option 3: Render.com

1. Sign up at https://render.com/
2. Create new "Web Service"
3. Connect repository
4. Build command: `npm install`
5. Start command: `npm start`
6. Free tier available

### Option 4: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`
5. Free tier available (with limitations)

### Important for Deployment:

Add this to `server.js` if deploying:
```javascript
const PORT = process.env.PORT || 3000;
```
(Already included in the code)

## Environment Variables

For production, you may want to add:
- `PORT` - Server port (default: 3000)
- `DATABASE_PATH` - Path to SQLite database file

Create a `.env` file:
```
PORT=3000
DATABASE_PATH=./tasks.db
```

Then install `dotenv`:
```bash
npm install dotenv
```

And add to top of `server.js`:
```javascript
require('dotenv').config();
```

## Customization

### Change Colors
Edit `public/styles.css`:
- Main gradient: Lines 8-9
- Day headers: Line 48
- Buttons: Lines 74-79, 120-125

### Add Features
- Edit `server.js` to add new API endpoints
- Edit `public/app.js` to add new frontend functionality
- Edit database schema in `initDatabase()` function

### Change Database
Replace SQLite with PostgreSQL or MySQL:
1. Install appropriate npm package
2. Update `server.js` database connection
3. Update SQL queries for syntax differences

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Database locked:**
- Close any other programs accessing the database
- Restart the server

**Tasks not loading:**
- Check browser console for errors
- Verify server is running
- Check that `tasks.db` exists

## License

MIT - Feel free to use and modify
