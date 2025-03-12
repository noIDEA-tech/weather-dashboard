import path from 'node:path';
import { fileURLToPath } from 'node:url';
// import { Router } from 'express';
import { Router, Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Route to serve the frontend in production
router.get('*', (_req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      // In production, serve the index.html from the client/dist directory
      res.sendFile(path.join(__dirname, '../../../client/dist/index.html'));
    } else {
      // In development, the Vite dev server handles the frontend
      res.status(404).send('Not found in development mode. Use the Vite dev server for frontend.');
    }
  });

export default router;
