import 'dotenv/config';
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import SteamOpenID from "steam-openid";
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

const steam = new SteamOpenID({
    returnUrl: `${BACKEND_URL}/auth/steam/return`,
    realm: BACKEND_URL,
});

// --- Database Initialization ---
async function initDatabase() {
    try {
        pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });
        const connection = await pool.getConnection();
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

// 2. Authentication Routes
app.get('/auth/steam', async (req, res) => {
  const redirectUrl = await steam.getRedirectUrl();
  res.redirect(redirectUrl);
});

app.get('/auth/steam/return', async (req, res) => {
  try {
    if (!dbReady) throw new Error("Database not ready.");
    const user = await steam.verify(req.query);
    const steamId = user.steamid;

    await pool.query(
      `INSERT INTO users (steam_id) VALUES (?) ON DUPLICATE KEY UPDATE last_login = CURRENT_TIMESTAMP`,
      [steamId]
    );
    
    res.redirect(`${FRONTEND_URL}/verify?steamId=${steamId}`);
  } catch (err) {
    console.error("Steam OpenID verification failed:", err.message);
    res.redirect(`${FRONTEND_URL}/login-failed?error=${encodeURIComponent(err.message)}`);
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