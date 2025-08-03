# ArduinoMart Database Guide

## 🗄️ SQLite Database Setup

ArduinoMart now uses SQLite for persistent data storage. Your orders and contacts will be saved even after server restarts!

## 📁 Database Files

- **`database.sqlite`** - Main database file (created automatically)
- **`migrations/`** - Database migration files

## 🚀 Database Commands

### Development 1
```bash
# Start the development server
npm run dev

# Generate new migration (when schema changes)
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database studio (visual database browser)
npm run db:studio
```

## 📊 What's Stored

### Orders Table
- Order ID, customer details, items, total amount
- Status tracking (pending/completed)
- Creation timestamps

### Contacts Table
- Contact form submissions
- Name, email, message
- Creation timestamps

## 🔄 Data Persistence

✅ **Orders persist** between server restarts  
✅ **Contacts persist** between server restarts  
✅ **Admin panel** shows all historical data  
✅ **No data loss** when server crashes or restarts  

## 🛠️ Database Management

### View Database Contents
```bash
npm run db:studio
```
This opens a web interface to browse and edit your database.

### Backup Database
Simply copy the `database.sqlite` file to backup your data.

### Reset Database
Delete `database.sqlite` and restart the server to start fresh.

## 📈 Benefits

- **No external dependencies** - SQLite is file-based
- **Automatic setup** - Database creates itself on first run
- **Production ready** - Can handle thousands of orders
- **Easy backup** - Just copy the database file
- **Cross-platform** - Works on Windows, Mac, Linux

Your ArduinoMart orders are now safely stored! 🎉 