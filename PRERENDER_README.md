# Pre-rendering Setup

## How It Works

This setup uses **Puppeteer** to pre-render your React app at build time. Here's what happens:

1. **Build**: Vite builds your app normally (`vite build`)
2. **Pre-render**: Puppeteer visits each route, waits for API calls to complete, and saves the rendered HTML
3. **Result**: Search engines and social media crawlers get fully rendered HTML with content

## Benefits

✅ **Perfect SEO**: Crawlers see fully rendered pages with content from your API
✅ **Social Media**: Facebook, Twitter, LinkedIn see proper Open Graph tags
✅ **Fast Indexing**: Search engines can index your content immediately
✅ **Still Dynamic**: Your app still fetches fresh content from Supabase API at runtime
✅ **No Backend Needed**: Everything runs at build time, no server required

## Usage

### Build with Pre-rendering

```bash
npm run build
```

This will:
1. Build your app with Vite
2. Start a local server
3. Use Puppeteer to visit each route and save pre-rendered HTML
4. Output pre-rendered files to `dist/`

### Build Without Pre-rendering

```bash
npm run build:only
```

Use this if you want to skip pre-rendering (faster, but worse SEO).

## Configuration

### Routes to Pre-render

Edit `scripts/prerender.js` to add/remove routes:

```javascript
const routes = [
  '/',
  '/about',
  '/products',
  '/contact',
  // Add more routes here
];
```

### Sitemap

Update `public/sitemap.xml` with your actual domain:

```xml
<loc>https://yoursite.com/</loc>
```

Replace `yoursite.com` with your actual domain.

## How It Works with Dynamic Content

1. **Build Time**: Puppeteer visits each route and waits for your Supabase API calls to complete
2. **Pre-rendered HTML**: Contains the content that was fetched during pre-rendering
3. **Runtime**: When users visit, React hydrates and fetches fresh content from API
4. **Best of Both**: Crawlers get content, users get fresh data

## Important Notes

⚠️ **API Calls During Build**: 
- Make sure your Supabase API is accessible during build
- If you use environment variables, ensure they're set during build
- The pre-renderer waits for API calls to complete (up to 30 seconds per page)

⚠️ **Build Time**:
- Pre-rendering adds ~10-30 seconds to build time
- Each route is rendered sequentially
- Consider using a CI/CD service with caching

⚠️ **Dynamic Routes**:
- Product detail pages (`/products/:id`) are not pre-rendered by default
- Add them to the routes array if needed
- Or use a dynamic sitemap generator

## Troubleshooting

### Pre-rendering fails with timeout

Increase timeout in `scripts/prerender.js`:
```javascript
await page.goto(url, {
  waitUntil: 'networkidle0',
  timeout: 60000, // Increase to 60 seconds
});
```

### Content not appearing in pre-rendered HTML

1. Check if API calls are completing
2. Increase wait time: `await page.waitForTimeout(5000);`
3. Check browser console in Puppeteer:
   ```javascript
   page.on('console', msg => console.log('PAGE LOG:', msg.text()));
   ```

### Path issues in nested routes

The script automatically fixes paths for nested routes. If you see broken assets:
- Check the path prefix calculation in `scripts/prerender.js`
- Ensure all assets use absolute paths or relative paths correctly

## Deployment

### Netlify/Vercel

These platforms automatically run `npm run build`:
- ✅ Pre-rendering runs automatically
- ✅ Pre-rendered HTML is served to crawlers
- ✅ Users get the dynamic React app

### Static Hosting

Upload the `dist/` folder to any static host:
- GitHub Pages
- AWS S3
- Cloudflare Pages
- Any CDN

### Custom Server

If using a custom server, ensure it:
- Serves pre-rendered HTML for routes in `dist/`
- Falls back to `index.html` for client-side routing
- Serves static assets correctly

## Testing

### Test Pre-rendered HTML

1. Build: `npm run build`
2. Preview: `npm run preview`
3. View source (not inspect): You should see full HTML with content
4. Test with curl:
   ```bash
   curl http://localhost:4173/ | grep "Rooj Essence"
   ```

### Test Social Media Previews

- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### Test Search Engine Crawling

- Google Search Console: Submit sitemap
- Test with Googlebot user agent:
  ```bash
  curl -A "Googlebot" http://localhost:4173/
  ```

## Next Steps

1. ✅ Update `public/sitemap.xml` with your domain
2. ✅ Update `public/robots.txt` if needed
3. ✅ Submit sitemap to Google Search Console
4. ✅ Test social media previews
5. ✅ Monitor indexing in Google Search Console

