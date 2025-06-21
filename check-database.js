import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MySQL connection configuration
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

async function checkDatabase() {
  const conn = await pool.getConnection();
  
  try {
    console.log("🔍 Checking MySQL Database Contents...\n");
    
    // Check users table
    console.log("📊 USERS TABLE:");
    console.log("=".repeat(50));
    const [users] = await conn.query("SELECT * FROM users ORDER BY created_at DESC");
    
    if (users.length === 0) {
      console.log("No users found in the database.");
    } else {
      console.log(`Found ${users.length} user(s):`);
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log(`   Steam ID: ${user.steam_id}`);
        console.log(`   API Key: ${user.api_key ? '✅ Set' : '❌ Not set'}`);
        console.log(`   Trade URL: ${user.trade_url ? '✅ Set' : '❌ Not set'}`);
        console.log(`   App Installed: ${user.app_installed ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Login: ${user.last_login}`);
      });
    }
    
    console.log("\n" + "=".repeat(50));
    
    // Check openid_logs table
    console.log("📋 OPENID LOGS TABLE:");
    console.log("=".repeat(50));
    const [logs] = await conn.query("SELECT * FROM openid_logs ORDER BY created_at DESC LIMIT 10");
    
    if (logs.length === 0) {
      console.log("No OpenID logs found in the database.");
    } else {
      console.log(`Found ${logs.length} recent OpenID log(s):`);
      logs.forEach((log, index) => {
        console.log(`\n${index + 1}. Log ID: ${log.id}`);
        console.log(`   Claimed ID: ${log.claimed_id}`);
        console.log(`   OP Endpoint: ${log.op_endpoint}`);
        console.log(`   Mode: ${log.mode}`);
        console.log(`   Created: ${log.created_at}`);
      });
    }
    
    console.log("\n" + "=".repeat(50));
    
    // Show table statistics
    console.log("📈 DATABASE STATISTICS:");
    console.log("=".repeat(50));
    
    const [userCount] = await conn.query("SELECT COUNT(*) as count FROM users");
    const [logCount] = await conn.query("SELECT COUNT(*) as count FROM openid_logs");
    const [recentUsers] = await conn.query("SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    const [recentLogs] = await conn.query("SELECT COUNT(*) as count FROM openid_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    
    console.log(`Total Users: ${userCount[0].count}`);
    console.log(`Total OpenID Logs: ${logCount[0].count}`);
    console.log(`Users (Last 7 days): ${recentUsers[0].count}`);
    console.log(`Logs (Last 7 days): ${recentLogs[0].count}`);
    
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

// Run the check
checkDatabase(); 