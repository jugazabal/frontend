# Notes frontend

This repository contains the frontend developed from part 2 onwards in the Full Stack course. The different stages of the application are saved in different branches.

Notes frontend is a simple web application for saving notes. It is developed using React and Vite. From part 3 of the course onwards, it is intended to be used with a separate backend, which is available in the repository https://github.com/fullstack-hy2020/part3-notes-backend.

## Running the application on your own machine

You can easily try out the application on your own machine. The current version of the application is developed using Node version 22.3.0. For the best experience, it is recommended to use the same major version of Node, but the application will likely work with other Node versions as well.

Follow these steps to run the application:

1. Clone this repository to your own machine with the command `git clone https://github.com/fullstack-hy2020/part2-notes-frontend.git`

2. Navigate to the cloned repository with the command `cd part2-notes-frontend`

3. Switch to the desired branch with the command `git switch <branch-name>`

4. Install the node modules with the command `npm install`

5. Start the application with the command `npm run dev`. By default, the application will start on port 5173, so it will be available at http://localhost:5173/

6. For this branch setup you can run the backend (Express) and frontend together. Options:
	 - In two terminals:
		 - `npm run backend:dev` (starts Express with nodemon on http://localhost:3001)
		 - `npm run dev` (starts Vite on http://localhost:5173 with a proxy to the backend under /api)
	 - Or in a single terminal (simple background start):
		 - `npm run dev:full`

	 The frontend makes requests to `/api/notes` (relative path). During development the Vite proxy forwards these to `http://localhost:3001/api/notes`. In production (a single deployment) the same origin can serve both.

Architecture diagram (simplified):

```
browser
	└─ React app (fetches /api/notes)

Vite dev server (localhost:5173)
	└─ Proxy /api -> Express backend (localhost:3001)

Express backend (index.js)
	└─ In-memory notes data
```

From part 3 onwards, the frontend is used with a [separate backend](https://github.com/fullstack-hy2020/part3-notes-backend).

## MongoDB persistence (current branch)

The backend has been upgraded to use MongoDB (via Mongoose) instead of file-based storage.

### Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to your connection string (Atlas or local) targeting database `noteApp`.
3. (Optional) Set `TEST_MONGODB_URI` to a separate database (e.g. `testNoteApp`) for isolation in tests (`NODE_ENV=test`). If omitted, tests fall back to `MONGODB_URI` (not recommended).
4. (Optional) Set `ALLOWED_ORIGINS` for extra CORS origins.
5. Start backend: `npm run backend:dev` (or `npm run dev:full`).

Environment variables summary:

| Variable | Purpose | Notes |
|----------|---------|-------|
| PORT | Backend listening port | Render/host will inject automatically |
| MONGODB_URI | Primary MongoDB connection | Required for dev/prod |
| TEST_MONGODB_URI | Test DB connection | Used only when `NODE_ENV=test` |
| VITE_API_BASE | Frontend override of API base | Leave empty if same origin |
| ALLOWED_ORIGINS | Extra CORS origins | Comma separated |

Scripts & modes:

| Script | NODE_ENV | What it does |
|--------|----------|-------------|
| npm run start | production | Start backend only (built assets) |
| npm run backend:dev | development | Backend with nodemon |
| npm run dev | development | Backend (watch) only (current branch) |
| npm run frontend | (n/a) | Vite frontend dev server |
| npm run dev:full | development | Backend + Vite concurrently |
| npm test | test | Run Vitest + API tests (uses TEST_MONGODB_URI) |
| npm run seed:mongo | development | Import legacy JSON notes |

Security tips:
* Never commit real credentials. `.env` is ignored.
* Use a least-privilege MongoDB user with `readWrite` on the specific databases only.
* Rotate credentials if they are ever exposed.
* A warning is logged if `TEST_MONGODB_URI` matches `MONGODB_URI` during tests.

### Import old notes

If you previously used file persistence (`data/notes.json` or `data/db.json`) import them:

```
MONGODB_URI=... npm run seed:mongo
```

Use `--force` to merge into a non-empty collection:

```
MONGODB_URI=... node import-notes.js --force
```

### API Changes

- IDs are now Mongo ObjectIds (string form) returned as `id`.
- Errors:
	- 400 malformatted id (invalid ObjectId)
	- 400 content missing
	- 404 note not found

### GraphQL endpoint & Apollo Explorer

- The GraphQL API is available at `/graphql`. During local development run `npm run dev:full` and open [http://localhost:3001/graphql](http://localhost:3001/graphql) to access Apollo Studio Explorer.
- Example query for listing notes:

```
query {
	allNotes {
		id
		content
		important
	}
}
```

- Example filtered query using the enum-style filter introduced in Part 8 tutorials:

```
query {
	importantNotes: allNotes(importance: YES) {
		id
		content
	}
	nonImportantNotes: allNotes(importance: NO) {
		id
		content
	}
}
```

- Example mutation for adding a note:

```
mutation {
	addNote(content: "GraphQL example", important: true) {
		id
		content
		important
	}
}
```

- To authenticate, first run the `login` mutation to obtain a JWT token and then set the `Authorization` header in the Explorer (e.g. `Bearer <token>`). Authenticated mutations such as `addNote` require this header.

### Model

See `models/note.js` for schema & JSON transform.


## Deploying to Render (single service)

1. Ensure the server serves the built frontend (already configured: Express serves files from `dist/`).
2. Push this repository to GitHub.
3. On Render dashboard: New -> Web Service -> connect the repo.
4. Set Build Command: `npm install && npm run build`.
5. Set Start Command: `node index.js` (or `npm run start:prod`).
6. Leave `PORT` unset (Render provides it). Do not set `VITE_API_BASE` so relative `/api` works.
7. Deploy and open the generated URL.
8. Verify:
	- React UI loads at `/`
	- API responds at `/api/notes`
	- Health endpoint `/health`

To redeploy, push new commits to the tracked branch (enable Auto Deploy in Render settings).

## How to switch between branches?

The different stages of the application are saved in different branches. Switching branches changes the code in your working directory to match the state of the branch you switched to. This allows you to work on different versions of the application without affecting the codebase of other branches.

You can switch to the desired branch by running the command `git switch <branch-name>`, for example `git switch part2-2`. Note that new dependencies are added to the application as development progresses, so after switching branches, it is safest to run the command `npm install` to ensure that any missing node modules will be installed on your machine.
