const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Series = require('../models/Series');
const Season = require('../models/Season');
const Episode = require('../models/Episode');
const User = require('../models/User');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

// ==================== PUBLIC ROUTES (No authentication needed) ====================

// Test public route
router.get('/public/test', (req, res) => {
    console.log('✅ PUBLIC TEST ROUTE CALLED');
    res.json({ message: 'Public route is working!', timestamp: new Date() });
});

// Get all series (public)
router.get('/public/series', async (req, res) => {
    try {
        console.log('🔍 GET /public/series called');
        const series = await Series.find()
            .populate('categories', 'name')
            .sort({ createdAt: -1 });
        
        console.log(`✅ Found ${series.length} series`);
        res.json(series);
    } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single series by ID (public)
router.get('/public/series/:id', async (req, res) => {
    try {
        const series = await Series.findById(req.params.id).populate('categories', 'name');
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }
        res.json(series);
    } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==================== BACKGROUND VIDEOS PUBLIC ROUTES ====================
router.get('/background-videos/list', async (req, res) => {
    try {
        const BUNNY_API_KEY = process.env.BUNNY_CDN_API_KEY;
        const BUNNY_STORAGE_ZONE = process.env.BUNNY_CDN_STORAGE_ZONE;
        const BUNNY_PULL_ZONE_URL = process.env.BUNNY_CDN_PULL_ZONE_URL;
        
        const response = await axios.get(`https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/backgrounds/`, {
            headers: { 'AccessKey': BUNNY_API_KEY }
        });
        
        const videos = response.data.map(file => ({
            name: decodeURIComponent(file.ObjectName),
            url: `${BUNNY_PULL_ZONE_URL}/backgrounds/${encodeURIComponent(file.ObjectName)}`,
            size: file.Length,
            lastModified: file.LastChanged
        }));
        
        res.json(videos);
    } catch (error) {
        console.error('Error fetching background videos:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/background-videos/playlist', async (req, res) => {
    try {
        let setting = await Settings.findOne({ key: 'background_playlist' });
        const playlist = setting ? JSON.parse(setting.value) : [];
        res.json({ playlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/background-videos/order', async (req, res) => {
    try {
        const { videoUrls } = req.body;
        let setting = await Settings.findOne({ key: 'background_playlist' });
        
        if (setting) {
            setting.value = JSON.stringify(videoUrls);
            await setting.save();
        } else {
            setting = await Settings.create({ key: 'background_playlist', value: JSON.stringify(videoUrls) });
        }
        
        res.json({ success: true, playlist: videoUrls });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/background-video/:filename', async (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const BUNNY_API_KEY = process.env.BUNNY_CDN_API_KEY;
        const BUNNY_STORAGE_ZONE = process.env.BUNNY_CDN_STORAGE_ZONE;
        
        await axios.delete(`https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/backgrounds/${filename}`, {
            headers: { 'AccessKey': BUNNY_API_KEY }
        });
        
        let setting = await Settings.findOne({ key: 'background_playlist' });
        if (setting) {
            let playlist = JSON.parse(setting.value);
            const videoUrl = `${process.env.BUNNY_CDN_PULL_ZONE_URL}/backgrounds/${encodeURIComponent(filename)}`;
            playlist = playlist.filter(url => url !== videoUrl);
            setting.value = JSON.stringify(playlist);
            await setting.save();
        }
        
        res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==================== BUNNY STREAM EPISODE UPLOAD (WITH SERIES NAME) ====================
router.post('/upload-episode-stream', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const file = req.file;
        const seriesId = req.body.seriesId;
        const seasonNumber = req.body.seasonNumber;
        const episodeNumber = req.body.episodeNumber;
        const episodeTitle = req.body.title;

        // Get series details
        const series = await Series.findById(seriesId);
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }
        const seriesTitle = series.title;

        const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;
        const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;

        if (!BUNNY_STREAM_API_KEY || !BUNNY_STREAM_LIBRARY_ID) {
            return res.status(500).json({ message: 'Bunny Stream API not configured' });
        }

        // Create full title with series name
        const fullTitle = `${seriesTitle} - S${seasonNumber}E${episodeNumber} - ${episodeTitle}`;
        console.log('📝 Creating video with title:', fullTitle);

        // Step 1: Create video in Bunny Stream
        const createResponse = await axios.post(
            `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos`,
            {
                title: fullTitle,
                collectionId: null
            },
            {
                headers: {
                    'AccessKey': BUNNY_STREAM_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        const videoId = createResponse.data.guid;
        console.log('✅ Stream video created:', videoId);

        // Step 2: Upload video file
        await axios.put(
            `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`,
            file.buffer,
            {
                headers: {
                    'AccessKey': BUNNY_STREAM_API_KEY,
                    'Content-Type': 'application/octet-stream'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log('✅ Stream video uploaded:', videoId);

        // Step 3: Get embed URL
        const videoUrl = `https://player.mediadelivery.net/play/${BUNNY_STREAM_LIBRARY_ID}/${videoId}`;

        res.json({ 
            success: true, 
            videoUrl, 
            videoId,
            title: fullTitle,
            message: 'Episode uploaded to Bunny Stream successfully!'
        });

    } catch (error) {
        console.error('Stream upload error:', error.response?.data || error.message);
        res.status(500).json({ 
            message: error.response?.data?.message || error.message 
        });
    }
});

// ==================== ADMIN ROUTES (Protected) ====================
router.use(protect, admin);

// Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const totalSeries = await Series.countDocuments();
        const totalEpisodes = await Episode.countDocuments();
        const totalUsers = await User.countDocuments();
        res.json({ totalSeries, totalEpisodes, totalUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/settings/background-video', async (req, res) => {
    try {
        let setting = await Settings.findOne({ key: 'background_video' });
        res.json({ videoUrl: setting ? setting.value : '' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/settings/background-video', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        let setting = await Settings.findOne({ key: 'background_video' });
        
        if (setting) {
            setting.value = videoUrl;
            await setting.save();
        } else {
            setting = await Settings.create({ key: 'background_video', value: videoUrl });
        }
        
        res.json({ success: true, videoUrl: setting.value });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload to Bunny CDN Storage (for images, trailers, backgrounds)
router.post('/upload-video', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const file = req.file;
        const folder = req.body.folder || 'videos';
        const safeFileName = file.originalname.replace(/\s/g, '_').replace(/\(/g, '').replace(/\)/g, '');
        const fileName = `${folder}/${Date.now()}-${safeFileName}`;
        
        const BUNNY_API_KEY = process.env.BUNNY_CDN_API_KEY;
        const BUNNY_STORAGE_ZONE = process.env.BUNNY_CDN_STORAGE_ZONE;
        const BUNNY_PULL_ZONE_URL = process.env.BUNNY_CDN_PULL_ZONE_URL;
        
        const https = require('https');
        
        const options = {
            hostname: 'storage.bunnycdn.com',
            path: `/${BUNNY_STORAGE_ZONE}/${fileName}`,
            method: 'PUT',
            headers: {
                'AccessKey': BUNNY_API_KEY,
                'Content-Type': file.mimetype
            }
        };
        
        const uploadPromise = new Promise((resolve, reject) => {
            const request = https.request(options, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        resolve(data);
                    } else {
                        reject(new Error(`Upload failed: ${response.statusCode} - ${data}`));
                    }
                });
            });
            
            request.on('error', reject);
            request.write(file.buffer);
            request.end();
        });
        
        await uploadPromise;
        
        const videoUrl = `${BUNNY_PULL_ZONE_URL}/${fileName}`;
        
        res.json({ success: true, videoUrl, fileName, message: 'Video uploaded successfully!' });
    } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const file = req.file;
        const folder = req.body.folder || 'images';
        const safeFileName = file.originalname.replace(/\s/g, '_').replace(/\(/g, '').replace(/\)/g, '');
        const fileName = `${folder}/${Date.now()}-${safeFileName}`;
        
        const BUNNY_API_KEY = process.env.BUNNY_CDN_API_KEY;
        const BUNNY_STORAGE_ZONE = process.env.BUNNY_CDN_STORAGE_ZONE;
        const BUNNY_PULL_ZONE_URL = process.env.BUNNY_CDN_PULL_ZONE_URL;
        
        const https = require('https');
        
        const options = {
            hostname: 'storage.bunnycdn.com',
            path: `/${BUNNY_STORAGE_ZONE}/${fileName}`,
            method: 'PUT',
            headers: {
                'AccessKey': BUNNY_API_KEY,
                'Content-Type': file.mimetype
            }
        };
        
        const uploadPromise = new Promise((resolve, reject) => {
            const request = https.request(options, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        resolve(data);
                    } else {
                        reject(new Error(`Upload failed: ${response.statusCode} - ${data}`));
                    }
                });
            });
            
            request.on('error', reject);
            request.write(file.buffer);
            request.end();
        });
        
        await uploadPromise;
        
        const imageUrl = `${BUNNY_PULL_ZONE_URL}/${fileName}`;
        
        res.json({ success: true, imageUrl, fileName, message: 'Image uploaded successfully!' });
    } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Categories CRUD
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const category = new Category({ name, slug, description, image });
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/categories/:id', async (req, res) => {
    try {
        const { name, description, image, isActive } = req.body;
        const slug = name ? name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : undefined;
        const updateData = { name, slug, description, image, isActive };
        const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Series CRUD
router.get('/series', async (req, res) => {
    try {
        const series = await Series.find().populate('categories').sort({ createdAt: -1 });
        res.json(series);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/series', async (req, res) => {
    try {
        const series = new Series(req.body);
        const savedSeries = await series.save();
        res.status(201).json(savedSeries);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/series/:id', async (req, res) => {
    try {
        const series = await Series.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(series);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/series/:id', async (req, res) => {
    try {
        await Series.findByIdAndDelete(req.params.id);
        await Season.deleteMany({ seriesId: req.params.id });
        await Episode.deleteMany({ seriesId: req.params.id });
        res.json({ message: 'Series deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Seasons CRUD
router.get('/seasons/:seriesId', async (req, res) => {
    try {
        const seasons = await Season.find({ seriesId: req.params.seriesId }).sort({ seasonNumber: 1 });
        res.json(seasons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/seasons', async (req, res) => {
    try {
        const season = new Season(req.body);
        const savedSeason = await season.save();
        const seasons = await Season.find({ seriesId: savedSeason.seriesId });
        await Series.findByIdAndUpdate(savedSeason.seriesId, { totalSeasons: seasons.length });
        res.status(201).json(savedSeason);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/seasons/:id', async (req, res) => {
    try {
        const season = await Season.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(season);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/seasons/:id', async (req, res) => {
    try {
        const season = await Season.findById(req.params.id);
        if (!season) return res.status(404).json({ message: 'Season not found' });
        
        await Season.findByIdAndDelete(req.params.id);
        await Episode.deleteMany({ seriesId: season.seriesId, seasonNumber: season.seasonNumber });
        const seasons = await Season.find({ seriesId: season.seriesId });
        await Series.findByIdAndUpdate(season.seriesId, { totalSeasons: seasons.length });
        res.json({ message: 'Season deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== EPISODES CRUD (CORRECT ORDER) ====================

// Get all episodes
router.get('/episodes', async (req, res) => {
    try {
        const episodes = await Episode.find().populate('seriesId', 'title');
        res.json(episodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get episodes by series and season (SPECIFIC route FIRST)
router.get('/episodes/series/:seriesId/season/:seasonNumber', async (req, res) => {
    try {
        const episodes = await Episode.find({ 
            seriesId: req.params.seriesId, 
            seasonNumber: parseInt(req.params.seasonNumber) 
        }).sort({ episodeNumber: 1 });
        res.json(episodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single episode by ID (GENERAL route AFTER specific)
router.get('/episodes/:id', async (req, res) => {
    try {
        console.log('🔍 Fetching episode with ID:', req.params.id);
        const episode = await Episode.findById(req.params.id);
        
        if (!episode) {
            console.log('❌ Episode not found:', req.params.id);
            return res.status(404).json({ message: 'Episode not found' });
        }
        
        console.log('✅ Episode found:', episode._id);
        res.json(episode);
    } catch (error) {
        console.error('Error fetching episode:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create new episode
router.post('/episodes', async (req, res) => {
    try {
        const episode = new Episode(req.body);
        const savedEpisode = await episode.save();
        res.status(201).json(savedEpisode);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update episode by ID
router.put('/episodes/:id', async (req, res) => {
    try {
        const episode = await Episode.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!episode) {
            return res.status(404).json({ message: 'Episode not found' });
        }
        res.json(episode);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete episode by ID
router.delete('/episodes/:id', async (req, res) => {
    try {
        const episode = await Episode.findByIdAndDelete(req.params.id);
        if (!episode) {
            return res.status(404).json({ message: 'Episode not found' });
        }
        res.json({ message: 'Episode deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Users Management
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/users/:id/role', async (req, res) => {
    try {
        const { isAdmin } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isAdmin }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `User role updated to ${isAdmin ? 'Admin' : 'User'}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;