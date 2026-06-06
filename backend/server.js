const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Database
const pool = new Pool({ 
    connectionString: "postgres://postgres:admin@localhost:5432/cinematic_timeline" 
}); // Make sure to change YOUR_PASSWORD here too!

// Create our API Route
app.get('/api/memories', async (req, res) => {
    try {
        // We use ST_X and ST_Y to pull the longitude and latitude out of PostGIS
        const query = `
            SELECT 
                id, 
                title, 
                memory_date, 
                ST_X(coordinates::geometry) as lng, 
                ST_Y(coordinates::geometry) as lat 
            FROM memories
        `;
        const { rows } = await pool.query(query);
        res.json({ data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Start the server
app.listen(5000, () => {
    console.log("Backend is running on http://localhost:5000");
});