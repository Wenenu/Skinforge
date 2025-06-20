import 'dotenv/config';
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { DiscordWebhook } from "./discordWebhook.js";

// --- App Configuration ---
const app = express();
const PORT = process.env.PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://150.136.130.59";
const BACKEND_URL = process.env.BACKEND_URL || `http://150.136.130.59:${PORT}`;

// --- Environment Variable Check ---
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
    console.error("FATAL: Missing one or more required environment variables for the database.");
    console.error("Required variables: MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE");
    console.error("Current config:", { 
        host: dbConfig.host, 
        user: dbConfig.user, 
        password: dbConfig.password ? '[SET]' : '[NOT SET]', 
        database: dbConfig.database 
    });
    process.exit(1);
}

// --- Middleware ---
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// --- Services ---
let pool;
let dbReady = false;
const webhook = new DiscordWebhook(process.env.DISCORD_WEBHOOK_URL);

// Initialize SteamOpenID with proper import handling
let steam;
try {
    const SteamOpenIDModule = await import("steam-openid");
    const SteamOpenID = SteamOpenIDModule.default.default;
    console.log('SteamOpenID imported successfully');
    
    steam = new SteamOpenID({
        returnUrl: `${BACKEND_URL}/auth/steam/return`,
        realm: BACKEND_URL,
    });
    console.log('SteamOpenID initialized successfully');
} catch (error) {
    console.error('Failed to initialize SteamOpenID:', error.message);
    console.error('Error details:', error);
    // Create a dummy steam object to prevent crashes
    steam = {
        getRedirectUrl: async () => {
            throw new Error('SteamOpenID not available');
        },
        verify: async () => {
            throw new Error('SteamOpenID not available');
        }
    };
}

// --- Database Initialization ---
async function initDatabase() {
    try {
        pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });
        const connection = await pool.getConnection();
        
        // Create page_visits table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS page_visits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                page_path VARCHAR(255) NOT NULL,
                user_agent TEXT,
                ip_address VARCHAR(45),
                referrer VARCHAR(512),
                visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('Successfully connected to MySQL database.');
        connection.release();
        dbReady = true;
    } catch (err) {
        console.error('FATAL: Failed to initialize database pool:', err.message);
        dbReady = false;
        throw err;
    }
}

// --- Routes ---

// 1. Health Check
app.get('/', (req, res) => {
  res.json({ 
    message: 'CSFloat Clone API is running',
    database: dbReady ? 'Connected' : 'Disconnected' 
  });
});

// Log page visits
app.post('/api/log-visit', async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  
  try {
    const { pagePath } = req.body;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    const referrer = req.get('Referer');
    
    await pool.query(
      'INSERT INTO page_visits (page_path, user_agent, ip_address, referrer) VALUES (?, ?, ?, ?)',
      [pagePath, userAgent, ipAddress, referrer]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error logging page visit:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Authentication Routes
app.get('/auth/steam', async (req, res) => {
  const redirectUrl = await steam.getRedirectUrl();
  res.redirect(redirectUrl);
});

app.get('/auth/steam/return', async (req, res) => {
  try {
    // Just verify the Steam authentication without storing anything
    const user = await steam.verify(req.query);
    console.log('Steam authentication successful for:', user.steamid);
    
    // Redirect back to home page
    res.redirect(FRONTEND_URL);
  } catch (err) {
    console.error("Steam OpenID verification failed:", err.message);
    // Even on error, redirect to home page
    res.redirect(FRONTEND_URL);
  }
});

// Handle old /verify redirects
app.get('/verify', async (req, res) => {
  try {
    // Just verify the Steam authentication without storing anything
    const user = await steam.verify(req.query);
    console.log('Steam authentication successful for:', user.steamid);
    
    // Redirect back to home page
    res.redirect(FRONTEND_URL);
  } catch (err) {
    console.error("Steam OpenID verification failed:", err.message);
    // Even on error, redirect to home page
    res.redirect(FRONTEND_URL);
  }
});

// 3. User API Routes (and all others that need the DB)
app.get("/api/user/:steamId", async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  const { steamId } = req.params;
  try {
    const [rows] = await pool.query("SELECT steam_id, api_key, trade_url, app_installed FROM users WHERE steam_id = ?", [steamId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/user/:steamId", async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  const { steamId } = req.params;
  const { apiKey, tradeUrl, appInstalled } = req.body;
  
  // Basic validation
  if (apiKey && typeof apiKey !== 'string') return res.status(400).json({ error: "Invalid API Key" });
  if (tradeUrl && typeof tradeUrl !== 'string') return res.status(400).json({ error: "Invalid Trade URL" });
  if (appInstalled && typeof appInstalled !== 'boolean') return res.status(400).json({ error: "Invalid appInstalled value" });

  try {
    const [result] = await pool.query(
      `UPDATE users SET 
        api_key = COALESCE(?, api_key),
        trade_url = COALESCE(?, trade_url),
        app_installed = COALESCE(?, app_installed)
       WHERE steam_id = ?`,
      [apiKey, tradeUrl, appInstalled, steamId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
    }
    
    webhook.sendUserUpdate(steamId, { apiKey, tradeUrl, appInstalled });
    
    res.json({ success: true, message: "Profile updated successfully." });
  } catch (err) {
    console.error("Error updating user data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. Admin Routes
app.get("/api/admin/users", async (req, res) => {
  // TODO: Add authentication/authorization for this endpoint
  try {
    const [rows] = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users for admin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/page-visits", async (req, res) => {
  // TODO: Add authentication/authorization for this endpoint
  try {
    const [rows] = await pool.query(`
      SELECT 
        page_path,
        COUNT(*) as visit_count,
        DATE(visited_at) as visit_date
      FROM page_visits 
      GROUP BY page_path, DATE(visited_at)
      ORDER BY visit_date DESC, visit_count DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching page visits for admin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/page-visits-summary", async (req, res) => {
  // TODO: Add authentication/authorization for this endpoint
  try {
    const [totalVisits] = await pool.query("SELECT COUNT(*) as total FROM page_visits");
    const [todayVisits] = await pool.query("SELECT COUNT(*) as today FROM page_visits WHERE DATE(visited_at) = CURDATE()");
    const [topPages] = await pool.query(`
      SELECT page_path, COUNT(*) as count 
      FROM page_visits 
      GROUP BY page_path 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    res.json({
      totalVisits: totalVisits[0].total,
      todayVisits: todayVisits[0].today,
      topPages
    });
  } catch (err) {
    console.error("Error fetching page visits summary for admin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Start Server ---
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Database status: ${dbReady ? 'Connected' : 'Failed'}`);
    });
  } catch (error) {
    console.error('Could not start server. Please check database credentials and connectivity.');
    process.exit(1);
  }
}

startServer();

// --- Graceful Shutdown ---
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server and DB pool');
  if (pool) await pool.end();
  process.exit(0);
}); 