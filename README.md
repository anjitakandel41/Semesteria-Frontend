# Semesteria Hiring Dashboard

The frontend for the Semesteria Hiring Dashboard. Candidates can browse open
positions and manage their applications. Recruiters can review applications
and update candidate stages.

The frontend uses a separate Django REST API. The API must be running for
sign-in and dashboard data to work.

## Requirements

- Node.js 20.9 or newer
- npm (included with Node.js)
- The Semesteria Django backend running locally or at another reachable URL

Check that Node.js and npm are installed:

```powershell
node --version
npm --version
```

## Install and configure

Open a terminal in the frontend project directory (the directory containing
`package.json`), then install the project dependencies:

```powershell
npm install
```

Create the local environment file from the example:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and set `NEXT_PUBLIC_API_URL` to the Django API base URL.
For the default local backend, use:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

If the backend runs at a different address or port, update this value. Keep
the `/api` suffix. `.env.local` is a local-only file and should not be
committed.

## Start the application

Start the Django backend first and make sure it is reachable at the URL
configured above. Then start the frontend development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Press
`Ctrl+C` in the terminal to stop the development server.

## Sign in

Use an account created by the backend's demo-data seed command, or another
account configured in the backend. The seeded demo accounts are:

| Role | Username | Password |
| --- | --- | --- |
| Candidate | `candidate1` | `Candidate@123` |
| Candidate | `candidate2` | `Candidate@456` |
| Recruiter | `recruiter1` | `Recruiter@123` |
| Recruiter | `recruiter2` | `Recruiter@456` |

These are development demo credentials only. Do not use them in production.
The login page also provides quick-fill buttons for `candidate1` and
`recruiter1`.

## Available commands

Run these from the frontend project directory:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Check the project with ESLint |
| `npm test` | Run the Vitest test suite |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve the production build (run `npm run build` first) |

For a production build, configure `NEXT_PUBLIC_API_URL` for the target
environment before running `npm run build`.

## Troubleshooting

- **The frontend cannot reach the API:** Check that Django is running and
  `NEXT_PUBLIC_API_URL` points to the correct API base URL.
- **Sign-in fails or API requests are blocked by CORS:** Configure the
  backend's allowed CORS origins to include the frontend origin, such as
  `http://localhost:3000`.
- **Environment changes do not take effect:** Stop and restart `npm run dev`
  after editing `.env.local`.
- **Dependencies are missing or inconsistent:** Run `npm install` again from
  the project directory.

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Vitest and Testing Library
