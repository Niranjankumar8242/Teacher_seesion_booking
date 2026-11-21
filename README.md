# Teacher Session Booking API

A REST API built with Node.js, TypeScript, Express, MongoDB, and Mongoose. Teachers publish available time slots, users book them, and booked sessions can be completed and shown in user history.

## Requirements

- Node.js 20 or newer
- MongoDB 7 or newer (local installation or Docker)
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and adjust it if needed:

   ```bash
   cp .env.example .env
   ```

3. Start MongoDB using either of the following local options.

   **Option A — Installed MongoDB**

   Start the MongoDB service installed on your computer. For example, on Linux:

   ```bash
   sudo systemctl start mongod
   ```

   On macOS with Homebrew:

   ```bash
   brew services start mongodb-community
   ```

   Ensure `.env` contains:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/teacher_booking
   ```

   **Option B — MongoDB with Docker**

   Docker runs MongoDB locally without requiring a direct MongoDB installation:

   ```bash
   docker compose up -d mongo
   ```

   Use the same connection string in `.env`:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/teacher_booking
   ```

   To stop the Docker container later:

   ```bash
   docker compose down
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The service listens on `http://localhost:3000` by default. `GET /health` returns a health response.

For a production-style run:

```bash
npm run build
npm start
```

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | — | MongoDB connection URI |
| `PORT` | No | `3000` | HTTP server port |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |

## API

All request and response bodies use JSON. Successful responses have a `data` property. Errors use `{ "error": { "message": "..." } }`.

### Create a user

`POST /users`

```json
{
  "fullName": "Aarav Shah",
  "email": "aarav@example.com",
  "phone": "+91 9876543210"
}
```

Returns `201 Created`. Duplicate emails return `409 Conflict`.

### Create a teacher (supporting endpoint)

`POST /teachers`

The assignment requires a teacher to exist before a session is created but does not define a teacher-creation API. This supporting endpoint makes that workflow testable.

```json
{
  "fullName": "Dr. Maya Rao",
  "email": "maya@example.com",
  "specialization": "Mathematics",
  "experience": 8
}
```

### Create a session

`POST /sessions`

```json
{
  "teacherId": "<teacher ObjectId>",
  "startTime": "2026-12-01T09:00:00.000Z",
  "endTime": "2026-12-01T10:00:00.000Z"
}
```

The teacher must exist and `endTime` must be later than `startTime`. Status is always initialized as `AVAILABLE`; client-supplied status and user fields are ignored.

### Find available sessions

`GET /sessions/available?dateTimestamp=1796092800000`

`dateTimestamp` accepts a Unix timestamp in milliseconds or an ISO-8601 date. A calendar day is interpreted in UTC (`00:00:00.000Z` inclusive to the following midnight exclusive). Results are produced with a MongoDB aggregation pipeline and include teacher details.

### Book a session

`POST /sessions/:id/book`

```json
{
  "userId": "<user ObjectId>"
}
```

Booking is an atomic conditional update: only a session whose current status is `AVAILABLE` can change to `BOOKED`. Concurrent attempts cannot both succeed. A missing user or session returns `404`; a session in any other status returns `409`.

### Complete a session

`PATCH /sessions/:id/complete`

Only a `BOOKED` session can be completed. The update atomically sets the status to `COMPLETED` and records `completedAt`. Invalid state transitions return `409`.

### Get a user's sessions

`GET /users/:id/sessions`

Returns:

```json
{
  "data": {
    "upcomingSessions": [],
    "completedSessions": []
  }
}
```

This endpoint uses a MongoDB aggregation pipeline with `$lookup`, `$project`, and `$facet`. `BOOKED` sessions are listed under `upcomingSessions`; `COMPLETED` sessions appear under `completedSessions`.

## Design notes

- Controllers use `async`/`await`; the async wrapper forwards rejected promises to one centralized error handler.
- ObjectIds and request fields are validated before database operations.
- Compound indexes support the available-session and user-history queries.
- Booking and completion use status in the update predicate to prevent race-condition-driven double transitions.
- Unknown endpoints return a structured `404` response.
- Dates are stored as MongoDB dates and serialized as ISO-8601 strings.

## Postman

Import [`postman/Teacher-Session-Booking.postman_collection.json`](postman/Teacher-Session-Booking.postman_collection.json). Run the collection in order. Test scripts capture the generated user, teacher, and session IDs; a pre-request script generates a session for tomorrow and the matching date timestamp automatically.

## Useful commands

```bash
npm run typecheck
npm run build
npm run dev
```
