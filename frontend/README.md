# Edu-Tech frontend

React + Vite frontend for the Edu-Tech coding platform. The editor uses
Monaco; code execution is handled by the backend and Judge0.

## Run locally

1. Start the backend using the instructions in `../backend/README.md`.
2. The Vite development server proxies `/api` requests to
   `http://localhost:5000`; set `VITE_API_URL` in `.env` only if you need a
   different API base URL.
3. Run `npm install` and then `npm run dev`.
4. Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

Create an account using the registration page. The backend stores accounts,
problems, and submissions in MongoDB, so they persist when the server restarts.
Run `npm run seed` from the backend directory to add the sample problems.

Administrators sign in at `/admin/login`. An administrator account must first
be created as a normal account and then promoted by a trusted operator in
MongoDB; registration never grants administrator access. The admin workspace
lets administrators publish stdin or function-style problems and review
paginated submissions from every student.
