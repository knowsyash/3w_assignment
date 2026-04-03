# Social MVP

This workspace contains a React frontend, an Express API, and MongoDB models for a small social app MVP.

## Features

- Signup and login with email and password
- Create posts with text, image, or both
- Public feed for all posts
- Like and comment on posts
- Store usernames with likes and comments

## Tech Stack

- Frontend: React.js with Vite + Material UI
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Styling: Material UI components + minimal global CSS

## Project Structure

- `client/` React app
- `server/` Express API and MongoDB models

## Environment Variables

Copy these examples before running locally:

- `.env.example` to `server/.env`
- `client/.env.example` to `client/.env`

### Server (`server/.env`)

- `PORT=5001`
- `MONGO_URI=<your mongodb atlas uri>`
- `MONGO_DB_NAME=3w`
- `CLIENT_URL=http://localhost:5173`

For production, set `CLIENT_URL` to your deployed Vercel frontend URL.

### Client (`client/.env`)

- `VITE_API_URL=http://localhost:5001` (local)
- In production on Vercel: `VITE_API_URL=https://<your-render-service>.onrender.com`

## Setup

1. Make sure MongoDB is running locally or update `server/.env` to point at MongoDB Atlas.
2. Run `npm install` from the workspace root.
3. Start the app with `npm run dev`.
4. If the backend starts in memory mode, the local MongoDB port was not reachable.

## Scripts

From the workspace root:

- `npm run dev` starts the frontend and backend together
- `npm run build` builds the frontend
- `npm run start` starts only the backend

## Deployment

### Backend on Render

1. Create a new Render Web Service from this repo.
2. Set Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `npm run start`
5. Set environment variables:
	- `MONGO_URI`
	- `MONGO_DB_NAME=3w`
	- `CLIENT_URL=https://<your-vercel-app>.vercel.app`
6. Use health check path: `/api/health`

`render.yaml` is included at repo root for IaC-style setup.

### Frontend on Vercel

1. Import this repo into Vercel.
2. Set Root Directory to `client`.
3. Framework Preset: `Vite`.
4. Set environment variable:
	- `VITE_API_URL=https://<your-render-service>.onrender.com`
5. Deploy.

`client/vercel.json` is included so SPA routes always rewrite to `index.html`.

## API Endpoints

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/posts`
- `POST /api/posts`
- `POST /api/posts/:postId/like`
- `POST /api/posts/:postId/comments`

## Notes

- TailwindCSS is not used.
- The UI is intentionally minimal and white-box based.

# 3w_assignment
