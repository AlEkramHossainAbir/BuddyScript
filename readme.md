# BuddyScript Monorepo

This repository contains:

- `client/`: Next.js frontend (React 19)
- `server/`: Express + MongoDB backend API

## Prerequisites

Install these first:

- Node.js 18 or newer
- npm 9 or newer
- MongoDB Atlas cluster (or any MongoDB connection string)
- Google Cloud OAuth credentials (for Google sign-in)

## 1) Install Dependencies

From the repository root, run:

```bash
cd server
npm install

cd ../client
npm install
```

## 2) Environment Variables

### Server env file

Create `server/.env` using `server/.env.example` as a base:

```env
PORT=8000
NODE_ENV=development

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buddyscript?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=postmessage

CLIENT_URL=http://localhost:3000
```

### Client env file

Create `client/.env` (or `client/.env.example`) using this template:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```


## 3) Run the Project

Use two terminals.

### Terminal A (backend)

```bash
cd server
npm run dev
```

Backend runs on `http://localhost:8000`.

### Terminal B (frontend)

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:3000`.

## 4) Verify Everything Is Working

- Open `http://localhost:3000` for the UI.
- Open `http://localhost:8000/api/health` for backend health check.
- Test register/login and Google sign-in from the frontend.

## Common Issues

- CORS error:
  - Ensure `CLIENT_URL` in `server/.env` includes `http://localhost:3000`.
- Mongo connection error:
  - Verify `MONGODB_URI` is valid and database network access allows your IP.
- Google login fails:
  - Ensure OAuth credentials are correct and authorized origins include your local URLs.
- 401 / invalid token:
  - Ensure `JWT_SECRET` is set and stable (changing it invalidates old tokens).


## Helpful API Paths

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/posts`
