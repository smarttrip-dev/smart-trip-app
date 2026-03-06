import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit"; // ⭐ CRITICAL FIX #5: Rate limiting

import { connectDB } from "./config/db.js";
import { scheduleBookingExpiryJob } from "./utils/bookingExpiryJob.js"; // ⭐ MAJOR FIX #10: Booking expiry
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from './routes/inventoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import savedTripRoutes from './routes/savedTripRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import configRoutes from './routes/configRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
    credentials: true,
};

app.use(cors(corsOptions));

// ⭐ RATE LIMITING (CRITICAL FIX #5) - Optimized for Railway
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health';
    },
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 login attempts per windowMs
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true, // don't count successful requests
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 uploads per hour
    message: 'Too many uploads, please try again later.',
});

app.use(express.json()); // This middleware will parse JSON bodies: req.body

// ⭐ HEALTH CHECK (Bypass rate limiting for Railway health checks)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Apply general rate limiter AFTER health check
app.use(generalLimiter);

// API Routes
app.use("/api/auth", loginLimiter, authRoutes); // ⭐ Rate limit login
app.use('/api/config', configRoutes);
app.use('/api/inventory', inventoryRoutes); // uploadLimiter applied per-route in inventoryRoutes (write ops only)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/saved-trips', savedTripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve static files (uploaded images, etc.)
app.use(express.static(path.join(__dirname, '../public')));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../../frontend/dist/index.html"));
    });
}

// ⭐ ERROR HANDLING (Catch unhandled errors in Railway)
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

app.use((err, req, res, next) => {
    console.error('Express Error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

connectDB().then(() => {
    // ⭐ MAJOR FIX #10: Schedule booking expiry job
    scheduleBookingExpiryJob();

    const server = app.listen(PORT, () => {
        console.log(`Server started on PORT: ${PORT}`);
    });

    // Graceful shutdown handling (for Railway deployment)
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Closing server gracefully...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
        // Force close after 30 seconds
        setTimeout(() => {
            console.error('Forced shutdown: Server did not close in time');
            process.exit(1);
        }, 30000);
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received. Closing server gracefully...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
}).catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});
