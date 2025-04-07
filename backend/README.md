# CloudPass Backend

The backend for CloudPass Manager, built with Cloudflare Workers.

## Setup
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Deploy to Cloudflare Workers: `npm run deploy`

## Configuration
- Update `wrangler.toml` with your KV namespace and R2 bucket details.
- Set environment variables for `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ENCRYPTION_KEY`.
