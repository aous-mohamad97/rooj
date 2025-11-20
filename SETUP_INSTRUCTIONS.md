# SEO Setup - Quick Start

## ✅ What Was Done

1. **Sitemap**: Created `public/sitemap.xml` for search engines
2. **Robots.txt**: Created `public/robots.txt` for crawler instructions
3. **Default Meta Tags**: Added to `index.html` as fallback

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Update Sitemap

Edit `public/sitemap.xml` and replace `yoursite.com` with your actual domain:

```xml
<loc>https://your-actual-domain.com/</loc>
```

### 3. Build

```bash
npm run build
```

This will build your React app.

### 4. Test Locally

```bash
npm run preview
```

Visit http://localhost:4173 to test your app.

## 📋 How It Works

1. **Build Time**: 
   - Vite builds your app
   - Static files are generated

2. **Runtime**:
   - Users visit your site
   - React fetches content from API
   - Everything works dynamically

3. **SEO Benefits**:
   - ✅ Sitemap helps search engines discover pages
   - ✅ Robots.txt guides crawlers
   - ✅ Meta tags for social media sharing

## ⚙️ Configuration

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

