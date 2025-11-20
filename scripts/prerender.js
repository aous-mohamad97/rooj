import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import { extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

// Routes to pre-render
const routes = [
  '/',
  '/about',
  '/products',
  '/contact',
];

// Simple static file server
function createStaticServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(distDir, req.url === '/' ? 'index.html' : req.url);
      
      // Security: prevent directory traversal
      if (!filePath.startsWith(distDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      // Check if file exists
      if (!existsSync(filePath)) {
        // For SPA routes, serve index.html
        if (!extname(filePath)) {
          filePath = join(distDir, 'index.html');
        } else {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
      }

      // Determine content type
      const ext = extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
      };
      const contentType = contentTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      createReadStream(filePath).pipe(res);
    });

    server.listen(port, () => {
      console.log(`Static server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function prerender() {
  console.log('🚀 Starting pre-rendering...');

  // Check if dist directory exists
  if (!existsSync(distDir)) {
    console.error('❌ dist directory not found. Run "npm run build:only" first.');
    process.exit(1);
  }

  const port = 4173;
  const baseUrl = `http://localhost:${port}`;

  // Start static server
  const server = await createStaticServer(port);

  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Pre-render each route
    for (const route of routes) {
      const url = `${baseUrl}${route}`;
      console.log(`📄 Pre-rendering: ${route}`);

      try {
        // Navigate to page
        await page.goto(url, {
          waitUntil: 'networkidle0', // Wait until network is idle
          timeout: 30000,
        });

        // Wait a bit more for API calls to complete
        await page.waitForTimeout(2000);

        // Get the rendered HTML
        const html = await page.content();

        // Determine output path
        let outputPath;
        if (route === '/') {
          outputPath = join(distDir, 'index.html');
        } else {
          // Create directory for route
          const routeDir = join(distDir, route);
          if (!existsSync(routeDir)) {
            mkdirSync(routeDir, { recursive: true });
          }
          outputPath = join(routeDir, 'index.html');
        }

        // Fix relative paths in HTML for nested routes
        let finalHtml = html;
        if (route !== '/') {
          const depth = route.split('/').filter(Boolean).length;
          const pathPrefix = '../'.repeat(depth);
          
          // Update script and link paths
          finalHtml = finalHtml
            .replace(/href="\//g, `href="${pathPrefix}`)
            .replace(/src="\//g, `src="${pathPrefix}`)
            .replace(/srcset="\//g, `srcset="${pathPrefix}`);
        }

        // Write pre-rendered HTML
        writeFileSync(outputPath, finalHtml, 'utf-8');
        console.log(`✅ Pre-rendered: ${route} -> ${outputPath}`);
      } catch (error) {
        console.error(`❌ Error pre-rendering ${route}:`, error.message);
      }
    }

    await browser.close();
    console.log('✨ Pre-rendering complete!');
  } catch (error) {
    console.error('❌ Pre-rendering failed:', error);
    process.exit(1);
  } finally {
    // Close server
    server.close();
  }
}

// Run pre-rendering
prerender().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

