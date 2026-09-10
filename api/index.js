import app from '../backend/src/app.js';

/**
 * Vercel Serverless Function entrypoint for RentEase API
 * Automatically forwards requests to the Express application
 */
export default function handler(req, res) {
  // Normalize URL to start with /api if stripped by reverse proxy / serverless routing
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  return app(req, res);
}
