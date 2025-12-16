import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import eventRoutes from './routes/eventRoutes';

// Load environment variables - try multiple paths
const envPath = path.resolve(process.cwd(), '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  // Try current directory
  dotenv.config();
}

console.log('Environment check:');
console.log('- Ticketmaster API Key:', process.env.TICKETMASTER_API_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('- Eventbrite API Key:', process.env.EVENTBRITE_API_KEY ? 'Loaded ✓' : 'Missing ✗');

const app = express();
const PORT = 3001; // Fixed port for consistency

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local Event Finder API is running' });
});

app.use('/api/events', eventRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
  console.log(`Health check: http://127.0.0.1:${PORT}/health`);
});

export default app;
