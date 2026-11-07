# Zaroor Shop

React + Vite shop (`client/`) and Express API (`server/`). No `.env` file is required. A clone uses `server/.env.example` and the shared database.

## Run

```bash
cd server
npm install
npm start
```

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:3000. The admin email and password are in `server/.env.example`.

Do not run `npm run seed`. That deletes the shared products and events.
