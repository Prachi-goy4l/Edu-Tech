# Edu-Tech backend

Node.js 18+ API for student accounts, coding problems, Judge0 execution, and
submission history. MongoDB stores accounts, problems, and submissions.

## Run locally

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env`, set a private `JWT_SECRET` of at least
   32 characters, and update `CLIENT_ORIGIN` for the frontend.
3. Start MongoDB and set `MONGODB_URI` to its database connection string.
5. From this directory run `npm install`, then `npm run seed` to add the sample
   problems (existing problems are not overwritten).
6. Run `npm run dev`.
6. Check `GET /api/health` to verify the API is running.

The seed command creates the function-style sample problems. It also converts
an older stdin-style `sum-two-numbers` seed to function style without changing
its MongoDB ID. Other existing records are not overwritten. The seed command
does not create demo accounts. Register through the website to create a
student account; to grant a trusted account administrator access, set that
student's `role` to `admin` directly in MongoDB. Registration never accepts a
role from the client.

- Function-style sample slug: `sum-two-numbers`
- Function-style sample slug: `two-sum`

Keep the MongoDB URI and JWT secret private. Back up the MongoDB database to
preserve account, problem, and submission data.

Judge0 is accessed only by the backend. Configure `JUDGE0_BASE_URL`; if your
Judge0 host requires RapidAPI authentication, also set `JUDGE0_API_KEY` and
`JUDGE0_API_HOST`. Use a Judge0 instance with execution limits enabled.

## API

All request and response bodies are JSON. Protected routes use
`Authorization: Bearer <token>`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create a student account |
| `POST` | `/api/auth/login` | Public | Log in and receive a JWT |
| `GET` | `/api/auth/me` | Student | Get the current account |
| `GET` | `/api/dashboard` | Student | Get problem/submission counts and recent submissions |
| `GET` | `/api/problems` | Public | List problems; supports `difficulty`, `search`, `page`, `limit` |
| `GET` | `/api/problems/:slug` | Public | Get problem details and public sample tests |
| `POST` | `/api/problems` | Admin | Create a problem and its test cases |
| `GET` | `/api/submissions/languages` | Public | Get Judge0 language IDs and names |
| `POST` | `/api/submissions/run` | Public | Run code against public tests only |
| `POST` | `/api/submissions` | Student | Evaluate against all tests and save the submission |
| `GET` | `/api/submissions` | Student | View own history; supports `problemSlug`, `page`, `limit` |
| `GET` | `/api/submissions/:id` | Student | View one of the student's submissions and source code |

Submission requests use this shape:

```json
{
  "problemSlug": "two-sum",
  "languageId": 71,
  "sourceCode": "print('hello')"
}
```

Use a language ID returned by `/api/submissions/languages`. Problem creation
accepts `slug`, `title`, `description`, `difficulty`, `tags`, `constraints`,
`starterCode` (an object keyed by language), `testCases`, and an optional
`mode` (`stdin` by default).

For stdin problems, each test case has `input`, `expectedOutput`, and optional
`isHidden`. For function problems, set `mode` to `function`, provide a
JavaScript-identifier `functionName`, and define each test case with `args`
(an array of positional arguments), `expected` (the JSON return value), and
optional `isHidden`. The platform wraps the submitted class method in a
generated test driver. Function-style problems currently support Python 3 and
Node.js Judge0 languages; `/api/submissions/languages` marks those entries
with `functionSupported: true`. The API never returns hidden test inputs or
expected outputs; run requests only execute public tests.

Example function-style problem fields:

```json
{
  "mode": "function",
  "functionName": "twoSum",
  "starterCode": {
    "python": "class Solution:\\n    def twoSum(self, nums, target):\\n        pass\\n",
    "javascript": "class Solution {\\n  twoSum(nums, target) {\\n  }\\n}\\n"
  },
  "testCases": [
    { "args": [[2, 7, 11, 15], 9], "expected": [0, 1], "isHidden": false },
    { "args": [[3, 3], 6], "expected": [0, 1], "isHidden": true }
  ]
}
```

Scores are the integer percentage of passed tests. Runtime is the sum of
Judge0-reported seconds across test cases; memory is the maximum reported KB.
Judge0's CPU and memory limits can be configured with the environment
variables above.
