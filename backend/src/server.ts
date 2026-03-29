import express from 'express';
import prisma from './config/db';

// Create the express app
const app = express();

// Parse incoming JSON payloads
app.use(express.json());

// Set the app to listen on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});