# Todo with Mongo

This workspace has two applications:

- `backend/` - Node.js, Express, and MongoDB API
- `frontend/` - React app built with Vite

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

## API Routes

- `GET /api/health`
- `GET /api/todos`
- `POST /api/todos`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`
