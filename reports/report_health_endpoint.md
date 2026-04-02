# Change Report: Health Endpoint

## Files Changed
- `server/index.ts`

## What Was Changed
Added a `/health` GET endpoint immediately after the Express application instance (`const app = express();`) is initialized. 

## Why 
The user requested the addition of this endpoint (expected to return `'OK'`) to act as a health check route for the application in `server/index.ts`.
