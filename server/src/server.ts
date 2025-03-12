import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

//load env variables from .env file
dotenv.config();

// Import the routes
import routes from './routes/index.js';

//set up file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// TODO: Serve static files of entire client dist folder
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
  }

// TODO: Implement middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
 
// TODO: Implement middleware to connect the routes
app.use(routes);

// Create directory for database if it doesn't exist
import fs from 'node:fs/promises';
const dbDirectory = path.join(__dirname, 'db');
fs.mkdir(dbDirectory, { recursive: true })
  .catch(err => console.error('Error creating DB directory:', err));

// Start the server on the port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });