# Infinitum
A cinematic AI companion app with two characters — **Samantha** (warm, curious, evolving) and **Nikki** (intense, passionate, sophisticated) — each powered by Gemini via the Google Generative AI API.

## Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express (API proxy)
- **AI**: Google Gemini (`gemini-2.0-flash`)
- **Deploy**: Railway

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set your API key
Create a `.env` file in the project root:
```
GEMINI_API_KEY=your-key-here
```

### 3. Start both servers
```bash
npm run dev
```
- Frontend (Vite): http://localhost:5173
- API server (Express): http://localhost:3001

The Vite dev server proxies `/api` requests to Express automatically.

---

## Deploy to Railway via GitHub

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-companion.git
git push -u origin main
```

### 2. Create a new Railway project
1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your `ai-companion` repository
4. Railway detects `nixpacks.toml` automatically

### 3. Add the environment variable
In your Railway project → **Variables** tab:
```
GEMINI_API_KEY = your-key-here
```

### 4. Deploy
Railway triggers a build automatically. It will:
1. Run `npm install`
2. Run `npm run build` (compiles React to `dist/`)
3. Start with `npm start` (Express serves `dist/` + handles `/api/chat`)

Your app will be live at your Railway-provided URL in ~2 minutes.

---

## Project Structure

```
ai-companion/
├── index.html          # Vite HTML entry
├── package.json
├── vite.config.js      # Dev proxy: /api → localhost:3001
├── nixpacks.toml       # Railway build config
├── server.js           # Express: API proxy + static server
└── src/
    ├── main.jsx
    ├── App.jsx          # React UI
    └── index.css        # All styles
```

## Environment Variables

| Variable        | Description               |
|-----------------|---------------------------|
| `GEMINI_API_KEY`| Your Google Gemini API key|
| `PORT`          | Server port (Railway sets)|
| `NODE_ENV`      | Set to `production` in start cmd |
