# 🚀 ArduinoMart Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - Free)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Set project name: `arduinomart`
   - Confirm deployment settings

### Option 2: Netlify (Free)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Drag and drop** the `dist` folder to [Netlify](https://netlify.com)

### Option 3: Railway (Paid - $5/month)

1. **Connect your GitHub repo** to Railway
2. **Set environment variables** if needed
3. **Deploy automatically**

## Environment Variables

If you need to set environment variables (for database, etc.):

```bash
# For Vercel
vercel env add DATABASE_URL
vercel env add SESSION_SECRET

# For Railway/other platforms
# Add in their dashboard
```

## Database Setup

For production, consider using:
- **Supabase** (Free tier available)
- **Neon** (Free tier available)
- **Railway Postgres** (Paid)

## Custom Domain

After deployment:
1. Go to your hosting platform dashboard
2. Add custom domain
3. Update DNS settings

## Local Testing

Test production build locally:
```bash
npm run build
npm start
```

## Troubleshooting

- **Build errors:** Check TypeScript compilation
- **Runtime errors:** Check environment variables
- **Database issues:** Ensure connection strings are correct

## Support

For deployment issues, check:
- Platform-specific documentation
- Console logs in hosting dashboard
- Network tab for API errors 