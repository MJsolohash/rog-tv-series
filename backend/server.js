const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database.js');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ==================== UPDATED CORS FOR VPS ====================
// Allow frontend domain and localhost for development
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://video.menakajanith.site',
    'http://video.menakajanith.site',
    'https://168.144.45.222',
    'http://168.144.45.222'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(null, true); // Allow anyway for production
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== SERVE STATIC FILES (if needed) ====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== ROUTES ====================
app.use('/api/users', require('./src/routes/userRoutes.js'));
app.use('/api/admin', require('./src/routes/adminRoutes.js'));

// ==================== TEST ROUTES ====================
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'TV Series API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        server: 'VPS Deployment'
    });
});

app.get('/api/direct-test', (req, res) => {
    res.json({ 
        message: 'Direct test route is working!',
        timestamp: new Date().toISOString()
    });
});

// ==================== DIRECT SERIES ROUTE (UPDATED with populate) ====================
app.get('/api/direct-series', async (req, res) => {
    try {
        const Series = require('./src/models/Series');
        // Added populate to get category names
        const series = await Series.find().populate('categories', 'name').sort({ createdAt: -1 });
        res.json({ 
            success: true, 
            count: series.length,
            series: series 
        });
    } catch (error) {
        console.error('Direct series error:', error);
        res.json({ success: false, error: error.message });
    }
});

// ==================== HEALTH CHECK ROUTE ====================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
    res.json({
        message: '🎬 TV Series Platform API Server Running',
        version: '1.0.0',
        endpoints: {
            test: '/api/test',
            series: '/api/direct-series',
            users: '/api/users',
            admin: '/api/admin'
        }
    });
});

// ==================== 404 HANDLER ====================
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ==================== START SERVER (UPDATED for VPS) ====================
const startServer = async () => {
    try {
        await connectDB();
        
        const PORT = process.env.PORT || 5000;
        const HOST = '0.0.0.0'; // Listen on all network interfaces
        
        app.listen(PORT, HOST, () => {
            console.log(`\n========================================`);
            console.log(`🚀 SERVER STARTED SUCCESSFULLY`);
            console.log(`========================================`);
            console.log(`📍 Local URL: http://localhost:${PORT}`);
            console.log(`📍 Network URL: http://${HOST}:${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}/api`);
            console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
            console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`========================================\n`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔴 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔴 Shutting down server...');
    process.exit(0);
});

startServer();