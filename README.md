# Weekly Task Manager - Vercel Edition

A drag-and-drop task manager optimized for Vercel deployment.

## ⚠️ Important Note

This Vercel version uses **temporary in-memory storage**. Tasks will be lost when the serverless function restarts (which happens frequently on Vercel's free tier).

**For persistent storage**, you have two options:
1. **Use Railway instead** (recommended - works with the original SQLite version)
2. **Upgrade to Vercel KV** (paid add-on for persistent storage)

## Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/
   - Sign in with GitHub
   - Click **"Add New Project"**
   - Select your repository
   - Click **"Deploy"**
   - Done! Vercel auto-detects the configuration

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts. Your app will be live in seconds!

## Project Structure

```
task-manager-vercel/
├── index.html          # Main HTML page
├── vercel.json         # Vercel configuration
├── package.json        # Dependencies
└── api/
    └── tasks.js        # Serverless function for API
```

## How It Works

- **Frontend**: Single `index.html` file with embedded CSS and JavaScript
- **Backend**: Vercel serverless function (`api/tasks.js`)
- **Storage**: In-memory (resets on function restart)

## API Endpoints

All endpoints are at `/api/tasks`:

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?day=monday` - Get tasks for a specific day
- `POST /api/tasks` - Create new task
- `PUT /api/tasks?id=1` - Update task
- `DELETE /api/tasks?id=1` - Delete task

## Upgrading to Persistent Storage

To add persistent storage with **Vercel KV**:

1. **Enable Vercel KV in your project:**
   - Go to your Vercel project dashboard
   - Click **Storage** → **Create Database** → **KV**
   - Follow setup instructions

2. **Install KV SDK:**
   ```bash
   npm install @vercel/kv
   ```

3. **Update `api/tasks.js`:**
   ```javascript
   import { kv } from '@vercel/kv';
   
   // Replace tasksStore with:
   const tasks = await kv.get('tasks') || [];
   
   // After modifications:
   await kv.set('tasks', tasks);
   ```

## Limitations

- ⚠️ **No persistent storage** on free tier without Vercel KV
- Tasks reset when serverless function restarts
- Good for testing, not production without upgrade

## Alternative: Use Railway

For free persistent storage, use the Railway version instead:
- SQLite database included
- Always-on server
- No storage limitations
- Better for production use

See the `task-manager-fullstack` folder for the Railway-compatible version.

## Customization

All code is in two files:
- **Frontend**: `index.html` (lines 1-600)
- **Backend**: `api/tasks.js` (lines 1-120)

Edit these files directly to customize the app!

## Troubleshooting

**"Not Found" error:**
- Make sure `vercel.json` is in the root directory
- Redeploy the project

**Tasks disappear:**
- This is expected without Vercel KV
- Use Railway for persistent storage

**API not working:**
- Check Vercel function logs in dashboard
- Ensure `api/tasks.js` is in the correct folder

## License

MIT - Free to use and modify
