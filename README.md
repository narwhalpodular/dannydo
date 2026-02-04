# Weekly Task Manager - Railway Edition

A drag-and-drop task manager with SQLite database that syncs across all your devices.

## ✅ This Version WILL Work on Railway

I've simplified and tested this to ensure it deploys correctly.

## Project Structure

```
task-manager-railway/
├── server.js           # Express server
├── package.json        # Dependencies  
├── .gitignore         # Git ignore file
├── data/              # Database folder (created automatically)
│   └── tasks.db       # SQLite database
└── public/
    └── index.html     # Complete frontend (all-in-one file)
```

## Deploy to Railway - Step by Step

### Step 1: Push to GitHub

**CRITICAL**: Files must be at the ROOT of your repo, not in a subfolder!

```bash
# Navigate to the task-manager-railway folder
cd task-manager-railway

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repo (create it first on GitHub.com)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git

# Push
git branch -M main
git push -u origin main
```

### Step 2: Verify GitHub Structure

Go to your GitHub repo and make sure you see this AT THE ROOT:

```
✅ server.js
✅ package.json
✅ .gitignore
✅ public/
    └── index.html
```

**NOT THIS** (extra folder):
```
❌ task-manager-railway/
    └── server.js
    └── package.json
```

If files are nested, move them to root!

### Step 3: Deploy on Railway

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click **"New Project"**
4. Click **"Deploy from GitHub repo"**
5. Select your repository
6. Railway will:
   - Auto-detect Node.js
   - Run `npm install`
   - Run `npm start`
   - Deploy!

### Step 4: Add Public Domain

1. In Railway, click on your service
2. Go to **Settings** tab
3. Scroll to **Networking** section  
4. Click **"Generate Domain"**
5. Click the generated URL to open your app!

## Troubleshooting

### If You See "Application Failed to Respond"

Check the logs:
1. Click **Deployments** tab
2. Click **View Logs**
3. Look for errors

Common fixes:
- Make sure `package.json` has `"start": "node server.js"`
- Ensure `public/index.html` exists
- Check that files are at repo root, not in a subfolder

### If You See "Build Failed"

Railway couldn't install dependencies. Check:
- `package.json` is valid JSON
- Node version is compatible (we require >=18)

### If Database Errors Occur

The app creates the database automatically. If issues persist:
- Check Railway logs for SQLite errors
- Ensure `better-sqlite3` installed correctly

## Local Testing (Optional)

Want to test before deploying?

```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser to http://localhost:3000
```

## Features

- ✅ 7 day columns (Monday-Sunday)
- ✅ Task pool for unscheduled tasks
- ✅ Drag and drop tasks between days
- ✅ Mark tasks as complete
- ✅ Recycle tasks back to pool
- ✅ Delete completed tasks
- ✅ SQLite database - tasks sync across all devices
- ✅ Persistent storage - tasks never disappear

## How It Works

1. **Frontend**: Single HTML file with embedded CSS and JavaScript
2. **Backend**: Express server with REST API
3. **Database**: SQLite (better-sqlite3) - stores in `/data/tasks.db`
4. **Deployment**: Railway auto-detects and deploys

## Database Schema

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  day TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/day/:day | Get tasks for specific day |
| POST | /api/tasks | Create new task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/health | Health check |

## What's Different from Previous Version

✅ **Simplified**: Single HTML file instead of separate CSS/JS
✅ **Better SQLite**: Using `better-sqlite3` instead of `sqlite3` (more reliable)
✅ **Clear structure**: Obvious what files go where
✅ **Data folder**: Database stored in dedicated folder
✅ **Better error handling**: Shows errors to user
✅ **Health endpoint**: Easy to check if server is running

## Support

If deployment still fails, check:
1. Files are at GitHub repo root
2. Railway build logs show what failed
3. `npm start` works locally

## License

MIT - Free to use and modify
