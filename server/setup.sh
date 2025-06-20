#!/bin/bash

echo "=== Skinforge Backend Setup ==="
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    echo "   On Ubuntu: sudo apt update && sudo apt install mysql-server"
    exit 1
fi

echo "✅ MySQL is installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with the required variables."
    exit 1
fi

echo "✅ .env file found"

# Prompt for MySQL credentials
echo ""
echo "Please enter your MySQL credentials:"
read -p "MySQL Username: " mysql_user
read -s -p "MySQL Password: " mysql_password
echo ""

# Update .env file with MySQL credentials
sed -i "s/your_mysql_username/$mysql_user/g" .env
sed -i "s/your_mysql_password/$mysql_password/g" .env

echo "✅ Updated .env file with MySQL credentials"

# Test MySQL connection
echo ""
echo "Testing MySQL connection..."
if mysql -u "$mysql_user" -p"$mysql_password" -e "SELECT 1;" &> /dev/null; then
    echo "✅ MySQL connection successful"
else
    echo "❌ MySQL connection failed. Please check your credentials."
    exit 1
fi

# Setup database
echo ""
echo "Setting up database..."
mysql -u "$mysql_user" -p"$mysql_password" < setup_database.sql

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed"
else
    echo "❌ Database setup failed"
    exit 1
fi

# Install dependencies
echo ""
echo "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with any additional configuration"
echo "2. Start the server with: pm2 start ecosystem.config.js"
echo "3. Check logs with: pm2 logs skinforge-backend" 