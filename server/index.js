const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
// WHY dotenv: never hardcode URLs, ports, or secrets in code.
// .env is in .gitignore — it never goes to GitHub.
// Different environments (dev, production) use different .env values.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ────────────────────────────────────────────────────────
// WHY these middleware in this order:

// cors: allows your React app (localhost:5173) to call this server (localhost:5000)
// Without cors, browsers block cross-origin requests by default (security feature).
// In production, you restrict this to your actual domain.
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// express.json(): parses incoming JSON request bodies
// Without this, req.body is undefined when client sends JSON.
// This replaces the manual body parsing you saw in the raw http example.
app.use(express.json());

// Request logger middleware — runs before every route
// WHY: you need to see every request during development.
// In production this becomes a proper logging library (Winston, Morgan).
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
    next(); // CRITICAL: call next() or the request hangs forever
});

// ── ROUTES ───────────────────────────────────────────────────────────
// WHY separate route files: same separation of concerns principle from Java.
// index.js knows THAT routes exist. Route files know WHAT they do.
// When taskRoutes changes, index.js doesn't need to change.
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// ── HEALTH CHECK ─────────────────────────────────────────────────────
// WHY: a simple endpoint to verify the server is running.
// Load balancers, CI/CD pipelines, and monitoring tools ping this.
// Returns 200 = server is alive. Anything else = alert the team.
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────────────
// WHY 4 parameters: Express recognises an error handler by its 4-param signature.
// When any route calls next(error), Express skips remaining middleware
// and jumps directly to this handler.
// Without this: unhandled errors crash the server or send HTML error pages.
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        // Only send stack trace in development - never in production
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ── 404 HANDLER ──────────────────────────────────────────────────────
// WHY after routes: only reached if NO route matched the request.
// Must be the last middleware before the error handler.
app.use((req, res, next) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found`});
});

// ── START SERVER ─────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`StudentOS server running on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`Environments: ${process.env.NODE_ENV || 'development'}`);
});