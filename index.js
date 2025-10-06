import express from "express";
import fetch from "node-fetch";
import path from "path";
import NodeCache from "node-cache";
import compression from "compression";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;
const mime = JSON.parse(fs.readFileSync("./mime.json", "utf8"));
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_CONFIG = {
  stdTTL: 600,
  checkperiod: 600,
  maxAge: 600,
  shortMaxAge: 300
};

const DEFAULT_REPO = {
  user: '3kh0',
  repo: '3kh0-Assets',
  branch: 'main'
};

const fileCache = new NodeCache({ 
  stdTTL: CACHE_CONFIG.stdTTL, 
  checkperiod: CACHE_CONFIG.checkperiod 
});

// CDN Provider path structure functions
const CDN_PROVIDERS = {
  cdn: (user, repo, branch, filePath) => 
    `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`,
  jsdcdn: (user, repo, branch, filePath) => 
    `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${filePath}`,
  rgcdn: (user, repo, branch, filePath) => 
    `https://raw.githack.com/${user}/${repo}/${branch}/${filePath}`,
  rawgcdn: (user, repo, branch, filePath) => 
    `https://raw.rawgit.net/${user}/${repo}/${branch}/${filePath}`,
  gitcfcdn: (user, repo, branch, filePath) => 
    `https://gh.maple3142.workers.dev/${user}/${repo}/${branch}/${filePath}`,
  staticallycdn: (user, repo, branch, filePath) => 
    `https://cdn.statically.io/gh/${user}/${repo}/${branch}/${filePath}`
};

// Cors middleware
const setupCORS = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
};

// Middleware to redirect requests for 3kho assets
const defaultRepoRedirect = (req, res, next) => {
  const paths = ['/js/', '/css/', '/json/'];
  const shouldRedirect = paths.some(path => req.path.startsWith(path));
  
  if (shouldRedirect) {
    const { user, repo, branch } = DEFAULT_REPO;
    const cdnPath = `/cdn/${user}/${repo}/${branch}${req.path}`;
    return res.redirect(cdnPath);
  }
  
  next();
};

// Get mime type from file extension so we don't need to check multiple times
const getMimeType = (url, contentType) => {
  if (contentType && contentType !== 'text/plain' && !contentType.includes('charset=utf-8')) {
    return contentType;
  }

  const ext = path.extname(url).slice(1);
  return mime[ext] || 'text/plain';
};

// Check if file is an image so we can handle it differently
const isImageContent = (contentType) => {
  return contentType && contentType.startsWith('image/');
}

const createCacheKey  = (user, repo, branch, path) => {
  return `${user}-${repo}-${branch}-${path}`
}

// Works directly from content variable as opposed to req & res
const removeLeadingSlashFromAttributes = (content) => {
  return content.replace(
    /(<(?:script|link|img|source)[^>]*(?:src|href|srcset)=["']?)\//g,
    '$1'
  );
}

// Fetch file from URL
const fetchFile = async (url) => {
  const response = await fetch(url);
  const content = await response.text();
  const contentType = getMimeType(url, response.headers.get('content-type'));

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    contentType,
    content
  };
}

// Handle responses of things we've already cached
const sendCachedResponse = (res, cachedFile) => {
    res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.maxAge}`);
    res.writeHead(cachedFile.status, {
        'Content-Type': cachedFile.contentType.split(';')[0]
    });
    res.end(cachedFile.content);
}

// Stream images to avoid memory issues
const streamImageResponse = async (res, response) => {
  const contentType = response.headers.get('content-type');
  res.setHeader('Content-Type', contentType);
  response.body.pipe(res);
};

// Handle content response with caching (on by default)
const sendFileResponse = async (res, file, cacheKey, shouldCache = true) => {
  if (shouldCache) {
    fileCache.set(cacheKey, file);
  }

  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.maxAge}`);
  res.writeHead(file.status, {
    'Content-Type': file.contentType.split(';')[0]
  });

  const processedContent = removeLeadingSlashFromAttributes(file.content);
  res.end(processedContent);
}

// Create CDN handler for modular cdn provider object thing
const createCDNHandler = (providerKey, shouldCache = true) => {
  return async (req, res) => {
    const { user, repo, branch } = req.params;
    const filePath = req.params[0];
    const cacheKey = createCacheKey(user, repo, branch, filePath);
    
    try {
      // Check the cache before fetching
      if (shouldCache) {
        const cachedFile = fileCache.get(cacheKey);
        if (cachedFile) {
          return sendCachedResponse(res, cachedFile);
        }
      }

      // Actually go fetch the file
      const cdnUrl = CDN_PROVIDERS[providerKey](user, repo, branch, filePath);
      const response = await fetch(cdnUrl);

      // Make sure the file exists
      if (response.status === 404) {
        return res.sendStatus(404);
      }

      // Handle images separately so we can stream them
      if (isImageContent(response.headers.get('content-type'))) {
        if (shouldCache) {
          res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.maxAge}`);
        }
        return streamImageResponse(res, response);
      }

      // Handle everything else
      const file = await fetchFile(cdnUrl);
      await sendFileResponse(res, file, cacheKey, shouldCache);

    } catch (error) {
      console.error(`Error fetching from ${providerKey}:`, error);
      res.sendStatus(404);
    }
  }
};

// Apply middleware
app.use(setupCORS);
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(defaultRepoRedirect);

// DE PIECE DE RESISTANCE
// Register each object of the cdn providers list as a route via our cdn handle function creator
Object.keys(CDN_PROVIDERS).forEach(provider => {
  console.log(`Registering route for ${provider}`);
  const shouldCache = provider !== 'jsdcdn'; // jsdelivr caches itself so dw
  app.get(`/${provider}/:user/:repo/:branch/*`, createCDNHandler(provider, shouldCache));
});

// Start the server
app.listen(port, () => {
  console.log(`Gitloaf Server listening on port ${port}!`);
});