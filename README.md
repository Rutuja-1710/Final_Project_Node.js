# Factory Equipment Maintenance Log System (Case Study 172)

Express + Mongoose + JWT + Multer backend, with a small React (Vite) frontend.

```
backend/   Express REST API (models, controllers, routes, middleware)
frontend/  React app: Login, Equipment List, Log Maintenance, Overdue Dashboard
docs/      Postman collection
```

## How it maps to the case study

| Requirement | Where |
|---|---|
| Equipment + MaintenanceLog schemas (referenced) | `backend/models/Equipment.js`, `MaintenanceLog.js` (log -> `equipment` ObjectId ref, `technician` ref to User) |
| Photo upload with Multer | `backend/middleware/upload.js` (disk storage, JPEG/PNG/WebP only, 5 MB limit, field name `photo`, optional) |
| Overdue query | `getOverdue` in `backend/controllers/equipmentController.js` (MongoDB aggregation: `(lastServicedDate ?? createdAt) + interval days < now`) |
| Supervisor-only interval config | `PATCH /equipment/:id/interval` guarded by `auth` + `authorizeRoles('supervisor')` |
| Validation | `express-validator` in routes; invalid uploads are deleted from disk |
| JWT auth | `backend/middleware/auth.js` |
| Maintenance history per equipment | `GET /equipment/:id/logs` |

`lastServicedDate` is updated automatically whenever a log is created (a back-dated log never moves it backwards). Equipment that has never been serviced is measured from its `createdAt`, so it shows up as overdue once its first interval passes.

## API

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | `{name, email, password, role}` role = technician / supervisor |
| POST | `/auth/login` | public | returns `{token, user}` |
| GET | `/equipment` | any user | |
| POST | `/equipment` | supervisor | `{name, location?, serviceIntervalDays}` |
| GET | `/equipment/overdue` | any user | `{count, equipment[]}` with `dueDate`, `daysOverdue` |
| GET | `/equipment/:id` | any user | |
| GET | `/equipment/:id/logs` | any user | history |
| PATCH | `/equipment/:id/interval` | **supervisor** | `{serviceIntervalDays}` |
| POST | `/logs` | any user | multipart: `equipment, description, type?, performedOn?, photo?` |
| GET | `/logs?equipment=<id>` | any user | |

Send `Authorization: Bearer <token>` on everything except `/auth/*`. Uploaded photos are served from `GET /uploads/<file>`.

## Run locally

1. Create a free MongoDB Atlas cluster, add a database user, and allow your IP (Network Access).
2. Backend:
   ```bash
   cd backend
   cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
   npm install
   npm run dev               # http://localhost:5000
   ```
3. Frontend:
   ```bash
   cd frontend
   cp .env.example .env      # VITE_API_BASE_URL=http://localhost:5000
   npm install
   npm run dev               # http://localhost:5173
   ```
4. Import `docs/postman_collection.json` into Postman/Thunder Client. Run **Register supervisor**, then **Register technician**, then the Equipment and Log requests in order (variables `token`, `equipmentId` fill themselves).

### Quick demo of the overdue dashboard
Create a machine with interval 1 day, then in Atlas edit its `lastServicedDate` (or `createdAt`) to a date a few days ago. It will appear on `/equipment/overdue` and the dashboard. Log maintenance for it and it disappears.

## Environment variables (backend)

`PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `UPLOAD_PATH`, `MAX_FILE_SIZE_MB`, `CLIENT_URL` (allowed frontend origin(s) for CORS).

## Deployment

**Backend (Render or Railway)**
1. Push the repo to GitHub. Create a new Web Service pointing at the `backend` folder (root directory = `backend`).
2. Build command `npm install`, start command `npm start`.
3. Set environment variables: `MONGO_URI` (Atlas), `JWT_SECRET` (long random string), `CLIENT_URL` (your Vercel/Netlify URL, no trailing slash). `PORT` is injected by the platform.
4. In Atlas -> Network Access, allow the host (or `0.0.0.0/0` for a student project).
5. Check `https://<your-service>/health`.

> **Important:** Render/Railway disks are ephemeral by default, so uploaded photos vanish on redeploy. Attach a persistent disk/volume and point `UPLOAD_PATH` at its mount path (e.g. `/data/uploads`), or move uploads to Cloudinary/S3 for production. Mention this in your report; it shows you understand the limitation.

**Frontend (Vercel or Netlify)**
1. Import the repo, set root directory to `frontend`.
2. Build command `npm run build`, output directory `dist`.
3. Add environment variable `VITE_API_BASE_URL=https://<your-backend-url>` (no trailing slash), then redeploy.
4. `vercel.json` and `public/_redirects` already handle client-side routing.

## Security notes (worth mentioning in your write-up)
- `/auth/register` accepts a `role` field so the demo is easy to try. In production, supervisors should be created by an admin or seeded, not self-selected.
- Passwords are hashed with bcrypt; JWTs carry only `id` and `role`.
- Uploads are restricted by MIME type and size, and stored under random filenames (originals are never trusted).
# Final_Project_Node.js
