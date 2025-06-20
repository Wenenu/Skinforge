# Skinforge Backend Server

This is the backend server for the Skinforge application, providing authentication, user management, and API endpoints.

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- PM2 (for process management)

## Quick Setup

1. **Run the automated setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Or follow the manual setup below**

## Manual Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3002

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=your_actual_mysql_username
MYSQL_PASSWORD=your_actual_mysql_password
MYSQL_DATABASE=skinforge_db

# Discord Configuration
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# App Configuration
APP_DOMAIN=localhost
```

### 3. Setup MySQL Database

1. **Create MySQL user (if needed):**
   ```sql
   CREATE USER 'skinforge_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON skinforge_db.* TO 'skinforge_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Run the database setup script:**
   ```bash
   mysql -u your_username -p < setup_database.sql
   ```

### 4. Start the Server

**Using PM2 (recommended):**
```bash
pm2 start ecosystem.config.js
```

**Using Node directly:**
```bash
npm start
```

## Troubleshooting

### MySQL Connection Errors

If you see `ER_ACCESS_DENIED_ERROR`, check:

1. **MySQL credentials in `.env` file**
2. **MySQL service is running:**
   ```bash
   sudo systemctl status mysql
   sudo systemctl start mysql  # if not running
   ```

3. **MySQL user permissions:**
   ```sql
   SHOW GRANTS FOR 'your_username'@'localhost';
   ```

### SteamOpenID Errors

If you see `SteamOpenID is not a constructor`:

1. **Check the import in `index.js`** - it should be:
   ```javascript
   import SteamOpenID from "steam-openid";
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### PM2 Issues

If PM2 is running old code:

1. **Stop all PM2 processes:**
   ```bash
   pm2 kill
   ```

2. **Clear PM2 cache:**
   ```bash
   pm2 cleardump
   ```

3. **Restart the application:**
   ```bash
   pm2 start ecosystem.config.js
   ```

## API Endpoints

- `GET /` - Health check
- `GET /auth/steam` - Steam authentication
- `GET /auth/steam/return` - Steam authentication callback
- `GET /api/user/:steamId` - Get user data
- `POST /api/user/:steamId` - Update user data
- `GET /api/admin/users` - Get all users (admin)

## Logs

View PM2 logs:
```bash
pm2 logs skinforge-backend
```

View error logs:
```bash
pm2 logs skinforge-backend --err
``` 