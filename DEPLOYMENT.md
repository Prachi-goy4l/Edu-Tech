# Deploying Edu-Tech to Vercel

Deploy the frontend and backend as **two Vercel projects from this repository**.
The backend runs as a Vercel Express Function and the frontend is a static Vite
site. The project-specific Vercel configuration is in `frontend/vercel.json`
and `backend/vercel.json`.

## 1. Deploy the backend

1. Import this Git repository as a new Vercel project.
2. Set **Root Directory** to `backend`.
3. Keep the detected Express framework and Node.js build settings.
4. Add these environment variables for Production (and Preview if needed):
   - `MONGODB_URI`: a hosted MongoDB connection string, such as a MongoDB Atlas
     URI. A local `127.0.0.1` database is not reachable from Vercel.
   - `JWT_SECRET`: a private random secret of at least 32 characters.
   - `CLIENT_ORIGIN`: the deployed frontend origin, such as
     `https://your-frontend.vercel.app` (no trailing slash). Include additional
     preview origins only if those deployments need access.
   - `JUDGE0_BASE_URL`: the Judge0 endpoint. If using a RapidAPI-hosted Judge0,
     also set `JUDGE0_API_KEY` and `JUDGE0_API_HOST`.
   - `JUDGE0_POLL_TIMEOUT_MS`: `45000` to keep a single Judge0 wait within the
     configured 60-second function duration.
5. Deploy and note the backend deployment URL.

The backend's seed script is a one-off command and is not run during deployment.
Run `npm run seed` from `backend` with a trusted environment configured for the
same hosted database if you want to add the sample problems.

## 2. Deploy the frontend

1. Import the same Git repository as another Vercel project.
2. Set **Root Directory** to `frontend`.
3. Keep the detected Vite framework, build command `npm run build`, and output
   directory `dist`.
4. Add this environment variable for Production (and Preview if needed):
   - `VITE_API_URL`: the backend origin followed by `/api`, for example
     `https://your-backend.vercel.app/api`.
     Use the backend project's domain, not the frontend project's domain. The
     `/api` suffix is added automatically if omitted, but the backend host is
     still required.
5. Deploy. The frontend Vercel configuration rewrites client-side routes such
   as `/admin/login` to the Vite app so direct links and refreshes work.

After deployment, set `CLIENT_ORIGIN` on the backend to the final frontend
domain, redeploy the backend, then verify `/api/health`, registration/login,
problem loading, and a code submission.

Vite embeds `VITE_API_URL` into the frontend at build time. After changing it
in Vercel's project environment variables, trigger a new frontend deployment
for the change to take effect.

## Runtime limitations

The backend function is configured for a maximum duration of 60 seconds, which
is also the maximum duration available to Vercel Hobby functions. Code execution
and submission test cases run sequentially through Judge0; if a request exceeds
the function limit, it will be terminated by Vercel. Keep test suites and Judge0
execution times short, or host the backend on a service suited to longer-running
requests and point `VITE_API_URL` at that API instead.
