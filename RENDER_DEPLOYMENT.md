# ArduinoMart - Render Deployment Guide

## 🚀 Deploy to Render (Free)

### Step 1: Sign up for Render
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email

### Step 2: Create a New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `SohamLonkar1026/aurdino-store`
3. Render will auto-detect it's a Node.js app

### Step 3: Configure the Service
- **Name**: `arduinomart`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free`

### Step 4: Environment Variables
Add these environment variables:
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will override this)

### Step 5: Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Install dependencies
   - Build the project
   - Start the server
   - Provide a URL (e.g., `https://arduinomart.onrender.com`)

## ✅ What's Included

### Frontend Features
- ✅ Homepage with Arduino Starter Kit showcase
- ✅ Products page with all Arduino components
- ✅ Shopping cart functionality
- ✅ Contact form
- ✅ About page with component details
- ✅ Admin panel for order management
- ✅ Responsive design for mobile/desktop

### Backend Features
- ✅ Express.js API server
- ✅ Order management system
- ✅ Contact form handling
- ✅ SQLite database (local storage)
- ✅ Health check endpoint

### Database
- Uses SQLite for local storage
- Orders and contacts are stored locally
- No external database setup required

## 🔧 Configuration Files

### render.yaml
- Defines the web service configuration
- Sets up environment variables
- Configures health checks

### package.json
- Updated start script for production
- Build commands for frontend and backend
- All necessary dependencies

## 🌐 Custom Domain (Optional)
1. Go to your Render dashboard
2. Select your service
3. Go to "Settings" → "Custom Domains"
4. Add your domain (e.g., `arduinomart.com`)
5. Update DNS records as instructed

## 📱 Features Working on Render
- ✅ Complete e-commerce functionality
- ✅ Order placement and management
- ✅ Contact form submissions
- ✅ Admin panel access
- ✅ Responsive design
- ✅ All Arduino components display
- ✅ Shopping cart with notifications

## 🆓 Free Tier Limits
- 750 hours/month (enough for 24/7)
- Automatic sleep after 15 minutes of inactivity
- 512MB RAM
- Shared CPU

## 🚨 Important Notes
- The app will sleep after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds
- All data is stored locally (SQLite)
- No external database required

## 🎯 Your ArduinoMart Website
Once deployed, your website will be available at:
`https://your-app-name.onrender.com`

Features:
- **Homepage**: Arduino Starter Kit showcase (₹1,200)
- **Products**: All Arduino components and kits
- **Contact**: WhatsApp: +91 9049235983, Email: arduinomartseller@gmail.com
- **Location**: VIT Campus, Pune
- **Admin**: Order management and contact form submissions

Ready to deploy! 🛒✨ 