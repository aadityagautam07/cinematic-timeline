require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const exifr = require('exifr');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Setup File Storage System
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir); // Create folder if it doesn't exist

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 2. Serve the uploads folder so the frontend can see the images
app.use('/uploads', express.static(uploadDir));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- ROUTE: GET ALL MEMORIES (NOW WITH SEARCH & FILTERING!) ---
app.get('/api/memories', async (req, res) => {
    try {
        const { search, tag } = req.query; // Catch the filters from the URL
        
        let query = `
            SELECT 
                m.id, m.title, m.description, m.memory_date, 
                ST_X(m.coordinates::geometry) as lng, 
                ST_Y(m.coordinates::geometry) as lat,
                COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as tags,
                (SELECT media_url FROM media WHERE memory_id = m.id LIMIT 1) as media_url,
                (SELECT media_type FROM media WHERE memory_id = m.id LIMIT 1) as media_type
            FROM memories m
            LEFT JOIN memory_tags mt ON m.id = mt.memory_id
            LEFT JOIN tags t ON mt.tag_id = t.id
        `;

        const conditions = [];
        const values = [];
        let valueIndex = 1;

        // 1. If user typed a search word, look in Title or Description
        if (search) {
            conditions.push(`(m.title ILIKE $${valueIndex} OR m.description ILIKE $${valueIndex})`);
            values.push(`%${search}%`); // The % symbols act as wildcards!
            valueIndex++;
        }

        // 2. If user is looking for a specific tag
        if (tag) {
            conditions.push(`EXISTS (
                SELECT 1 FROM memory_tags mt2 
                JOIN tags t2 ON mt2.tag_id = t2.id 
                WHERE mt2.memory_id = m.id AND t2.name ILIKE $${valueIndex}
            )`);
            values.push(`%${tag}%`);
            valueIndex++;
        }

        // Combine the conditions if any exist
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` GROUP BY m.id ORDER BY m.memory_date DESC`;

        const { rows } = await pool.query(query, values);
        res.json({ data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// --- ROUTE: UPLOAD FILE & EXTRACT EXIF ---
// Notice the `upload.single('mediaFile')` - this catches the file!
app.post('/api/memories', upload.single('mediaFile'), async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        let { lat, lng } = req.body; // Fallback coordinates
        let mediaUrl = null;
        let mediaType = 'IMAGE';

        // 3. If a file was uploaded, process it
        if (req.file) {
            mediaUrl = `http://localhost:5000/uploads/${req.file.filename}`;
            
            // Check if it's a video based on extension
            if (req.file.mimetype.startsWith('video/')) {
                mediaType = 'VIDEO';
            } else {
                // IT'S AN IMAGE: Let's extract the GPS data!
                try {
                    const gps = await exifr.gps(req.file.path);
                    if (gps && gps.latitude && gps.longitude) {
                        lat = gps.latitude;
                        lng = gps.longitude;
                        console.log(`📍 Magic! Found GPS: ${lat}, ${lng}`);
                    }
                } catch (exifErr) {
                    console.log("No GPS data found in this image.");
                }
            }
        }

        const userResult = await pool.query('SELECT id FROM users LIMIT 1');
        const userId = userResult.rows[0].id;

        // 4. Save Memory to Database (Now with Description!)
        const memoryQuery = `
            INSERT INTO memories (user_id, title, description, memory_date, coordinates) 
            VALUES ($1, $2, $3, NOW(), ST_SetSRID(ST_MakePoint($4, $5), 4326)) RETURNING id
        `;
        const memoryResult = await pool.query(memoryQuery, [userId, title, description, lng || 0, lat || 0]);
        const newMemoryId = memoryResult.rows[0].id;

        // 5. Save Media
        if (mediaUrl) {
            await pool.query(
                `INSERT INTO media (memory_id, media_type, media_url) VALUES ($1, $2, $3)`,
                [newMemoryId, mediaType, mediaUrl]
            );
        }

        // 6. Save Tags
        if (tags) {
            const parsedTags = JSON.parse(tags); // Frontend will send tags as JSON string
            for (const tagName of parsedTags) {
                const cleanTag = tagName.trim();
                if (!cleanTag) continue;
                let tagRes = await pool.query('SELECT id FROM tags WHERE name = $1', [cleanTag]);
                let tagId;
                if (tagRes.rows.length === 0) {
                    const insertRes = await pool.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [cleanTag]);
                    tagId = insertRes.rows[0].id;
                } else {
                    tagId = tagRes.rows[0].id;
                }
                await pool.query('INSERT INTO memory_tags (memory_id, tag_id) VALUES ($1, $2)', [newMemoryId, tagId]);
            }
        }

        res.json({ success: true, message: "Memory saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save memory' });
    }
});

// --- ROUTE: GET DASHBOARD STATISTICS ---
app.get('/api/recap', async (req, res) => {
    try {
        // 1. Count Total Memories
        const totalRes = await pool.query('SELECT COUNT(*) FROM memories');
        const totalMemories = parseInt(totalRes.rows[0].count);

        // 2. Calculate Top 5 Tags
        const tagsRes = await pool.query(`
            SELECT t.name, COUNT(mt.memory_id) as count
            FROM tags t
            JOIN memory_tags mt ON t.id = mt.tag_id
            GROUP BY t.id, t.name
            ORDER BY count DESC
            LIMIT 5
        `);

        // 3. Calculate Memories by Month (For a chart!)
        const monthRes = await pool.query(`
            SELECT TO_CHAR(memory_date, 'Mon') as month, COUNT(*) as count
            FROM memories
            GROUP BY TO_CHAR(memory_date, 'Mon'), EXTRACT(MONTH FROM memory_date)
            ORDER BY EXTRACT(MONTH FROM memory_date)
        `);

        res.json({
            totalMemories,
            topTags: tagsRes.rows,
            monthlyData: monthRes.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recap stats' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));