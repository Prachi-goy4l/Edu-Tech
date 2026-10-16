# Edu-Tech frontend

React + Vite frontend for the Edu-Tech coding platform. The editor uses
Monaco; code execution is handled by the backend and Judge0.

## Run locally

1. Start the backend using the instructions in `../backend/README.md`.
2. Copy `.env.example` to `.env` if the backend is not at
   `http://localhost:5000/api`.
3. Run `npm install` and then `npm run dev`.
4. Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

Create an account using the registration page. The backend stores accounts,
problems, and submissions in MongoDB, so they persist when the server restarts.
Run `npm run seed` from the backend directory to add the sample problems.
