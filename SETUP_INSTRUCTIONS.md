# SEO Pre-rendering Setup - Quick Start

## ✅ What Was Done

1. **Pre-rendering Script**: Created `scripts/prerender.js` that uses Puppeteer to pre-render pages
2. **Build Scripts**: Updated `package.json` to run pre-rendering after build
3. **Sitemap**: Created `public/sitemap.xml` for search engines
4. **Robots.txt**: Created `public/robots.txt` for crawler instructions
5. **Default Meta Tags**: Added to `index.html` as fallback

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install Puppeteer (used for pre-rendering).

### 2. Update Sitemap

Edit `public/sitemap.xml` and replace `yoursite.com` with your actual domain:

```xml
<loc>https://your-actual-domain.com/</loc>
```

### 3. Build with Pre-rendering

```bash
npm run build
```

This will:
- Build your React app
- Pre-render all routes with content from your Supabase API
- Generate SEO-friendly HTML files

### 4. Test Locally

```bash
npm run preview
```

Visit http://localhost:4173 and view page source - you should see fully rendered HTML with content!

## 📋 How It Works

1. **Build Time**: 
   - Vite builds your app
   - Puppeteer starts a local server
   - Visits each route (/, /about, /products, /contact)
   - Waits for Supabase API calls to complete
   - Saves the rendered HTML

2. **Runtime**:
   - Users visit your site
   - React hydrates and fetches fresh content from API
   - Everything works dynamically as before

3. **SEO Benefits**:
   - ✅ Search engines see fully rendered pages
   - ✅ Social media crawlers see Open Graph tags
   - ✅ Fast indexing
   - ✅ No backend needed!

## ⚙️ Configuration

### Add More Routes

Edit `scripts/prerender.js`:

```javascript
const routes = [
  '/',
  '/about',
  '/products',
  '/contact',
  '/your-new-route',  // Add here
];
```

### Environment Variables

Make sure your Supabase environment variables are set during build:

```bash
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
npm run build
```

## 🎯 Next Steps

1. ✅ Update sitemap with your domain
2. ✅ Build and test locally
3. ✅ Deploy to your hosting
4. ✅ Submit sitemap to Google Search Console
5. ✅ Test social media previews

## 📚 More Info

See `PRERENDER_README.md` for detailed documentation.

