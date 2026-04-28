# MERN Todo + Auth + Friends + Chat

This workspace has two applications with modular architecture:

- `backend/` - Node.js + Express + MongoDB + JWT + Socket.io
- `frontend/` - React (hooks + functional components) + Router + Socket.io client

## Run the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API runs on `http://localhost:5050`.

## Run the frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The React app runs on `http://localhost:5173`.

## Environment

Backend `.env`:

```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/todo_app
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=change_me
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5050/api
VITE_SERVER_URL=http://localhost:5050
```

## API Routes (Core)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/profile/:username`
- `PUT /api/profile/update`
- `GET /api/users/search?q=`
- `POST /api/request/send/:userId`
- `POST /api/request/accept/:userId`
- `POST /api/request/reject/:userId`
- `GET /api/todos`
- `POST /api/todos`
- `PATCH /api/todos/item/:todoId`
- `DELETE /api/todos/item/:todoId`
- `GET /api/todos/:username` (friends-only unless self)
- `GET /api/messages/:userId` (friends-only chat history)

Socket.io events:

- `chat:send` (client -> server)
- `chat:message` (server -> clients)
