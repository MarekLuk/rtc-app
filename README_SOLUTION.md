# Real-time Crawlers - Interview Task

## Requirements

- docker `>=23.0.5`
- docker-compose `>=2.24.6`

## Installation

1. Clone the repo: `git clone <https://github.com/MarekLuk/rtc-app.git>` `cd <repo-folder>`
2. Install dependencies: `npm install`

## Docker

Build and run (no cache): `docker compose build --no-cache` `docker compose up` command.
Run (with cache):`docker compose up` command.  
The API will be available at http://localhost:3001.

## Scripts

- `npm run build` Compile TypeScript into `dist/`
- `npm start` Run the compiled code
- `npm run dev` Build and run in development mode
- `npm test` Run tests with coverage
- `npm run test:rof` Run tests and show coverage only on failure
- `npm run test:watch` Run Vitest in watch mode
- `npm run format` Format code with Prettier
- `npm run format:check` Check formatting without rewriting files

## Testing

Tests are written with Vitest.
`npm test`

## Environment Variables

`PORT` — port number (default: 3001)

## API Endpoints

GET /client/state — Returns the current state of the simulation run
