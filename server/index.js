import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import SteamOpenIDModule from "steam-openid";
import 'dotenv/config';
import { DiscordWebhook } from "./discordWebhook.js";

const app = express();
const PORT = process.env.PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://150.136.130.59";
const BACKEND_URL = process.env.BACKEND_URL || `http://150.136.130.59:${PORT}`;

// Middleware
app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Services
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const webhook = new DiscordWebhook(process.env.DISCORD_WEBHOOK_URL);

// ESM/CJS compatibility fix for steam-openid
const SteamOpenID = SteamOpenIDModule.default || SteamOpenIDModule;
const steam = new SteamOpenID({
  returnUrl: `${BACKEND_URL}/auth/steam/return`,
  realm: BACKEND_URL,
});

// Database Initialization
async function initDatabase() {
  try {
    const conn = await pool.getConnection();
    console.log('Successfully connected to MySQL database.');
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        steam_id VARCHAR(255) UNIQUE NOT NULL,
        api_key VARCHAR(255),
        trade_url VARCHAR(512),
        app_installed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS openid_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        claimed_id VARCHAR(255),
        op_endpoint VARCHAR(255),
        mode VARCHAR(50),
        ns VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database tables are ready.');
    conn.release();
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

// --- Routes ---

// 1. Authentication Routes
app.get('/auth/steam', async (req, res) => {
  const redirectUrl = await steam.getRedirectUrl();
  res.redirect(redirectUrl);
});

app.get('/auth/steam/return', async (req, res) => {
  try {
    const user = await steam.verify(req.query);
    const steamId = user.steamid;

    const conn = await pool.getConnection();
    try {
      await conn.query(
        "INSERT INTO openid_logs (claimed_id, op_endpoint, mode, ns) VALUES (?, ?, ?, ?)",
        [req.query["openid.claimed_id"], req.query["openid.op_endpoint"], req.query["openid.mode"], req.query["openid.ns"]]
      );

      await conn.query(
        `INSERT INTO users (steam_id) VALUES (?) ON DUPLICATE KEY UPDATE last_login = CURRENT_TIMESTAMP`,
        [steamId]
      );
    } finally {
      conn.release();
    }
    
    res.redirect(`${FRONTEND_URL}/verify?steamId=${steamId}`);
  } catch (err) {
    console.error("Steam OpenID verification failed:", err);
    res.redirect(`${FRONTEND_URL}/login-failed`);
  }
});

// 2. User API Routes
app.get("/api/user/:steamId", async (req, res) => {
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


// 3. Admin Routes
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

// Root/Health Check
app.get('/', (req, res) => {
  res.json({ message: 'CSFloat Clone API is running' });
});

// Start Server
app.listen(PORT, async () => {
  await initDatabase();
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Frontend expected at: ${FRONTEND_URL}`);
  console.log(`Backend listening at: ${BACKEND_URL}`);
}); 