const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const NodeCache = require('node-cache');
const compression = require('compression');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

const fileCache = new NodeCache({ stdTTL: 600, checkperiod: 600 });

function rewriteURLAndRedirect(req, res, next) {
  const user = '3kh0';
  const repo = '3kh0-Assets';
  const branch = 'main';

  if (req.path.startsWith('/js/') || req.path.startsWith('/css/') || req.path.startsWith('/json/')) {
    const cdnPath = `/cdn/${user}/${repo}/${branch}${req.path}`;
    return res.redirect(cdnPath);
  }

  next();
}


async function fetchFile(url) {
  const response = await fetch(url);
  const content = await response.text();

  let contentType = response.headers.get('content-type');
  if (!contentType || contentType === 'text/plain' || contentType.includes('charset=utf-8')) {
    const fileExtension = path.extname(url);
    switch (fileExtension) {
      case '.html':
      case '.php':
        contentType = 'text/html';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'application/javascript';
        break;
        case '.go':
        contentType = 'text/html';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.htm':
        contentType = 'text/html';
        break;
      case '.javascript':
        contentType = 'text/javascript';
        break;
      case '.javascript':
        contentType = 'application/javascript';
        break;
      case '.go':
        contentType = 'text/html';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
         case '.xpi':
        contentType = 'text/plain';
        break;
      case '.xml':
        contentType = 'application/xml';
        break;
      case '.':
        contentType = 'text/plain';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
        case '.hypertextmarkuplanguage':
        contentType = 'text/html';
        break;
      case '.ico':
        contentType = 'image/x-icon';
        break;
      case '.ttf':
        contentType = 'font/ttf';
        break;
      case '.woff':
        contentType = 'font/woff';
        break;
      case '.woff2':
        contentType = 'font/woff2';
        break;
      case '.otf':
        contentType = 'font/otf';
        break;
      case '.eot':
        contentType = 'application/vnd.ms-fontobject';
        break;
      case '.md':
        contentType = 'text/markdown';
        break;
        case '.markdown':
        contentType = 'text/markdown';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.text':
        contentType = 'text/plain';
        break;
      case '.csv':
        contentType = 'text/csv';
        break;
      case '.mp3':
        contentType = 'audio/mpeg';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
      case '.ogg':
        contentType = 'audio/ogg';
        break;
      case '.webm':
        contentType = 'audio/webm';
        break;
      case '.mp4':
        contentType = 'video/mp4';
        break;
      case '.ogv':
        contentType = 'video/ogg';
        break;
      case '.webmv':
        contentType = 'video/webm';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.zip':
        contentType = 'application/zip';
        break;
      case '.gz':
        contentType = 'application/gzip';
        break;
      case '.bz2':
        contentType = 'application/x-bzip2';
        break;
      case '.7z':
        contentType = 'application/x-7z-compressed';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.ppt':
        contentType = 'application/vnd.ms-powerpoint';
        break;
      case '.pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case '.xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.bmp':
        contentType = 'image/bmp';
        break;
      case '.wasm':
        contentType = 'application/wasm';
        break;
      case '.data':
        contentType = 'application/octet-stream';
        break;
      case '.unityweb':
        contentType = 'application/octet-stream';
        break;
      case '.mem':
        contentType = 'application/octet-stream';
        break;
      case '.symbols':
        contentType = 'application/octet-stream';
        break;
      case '.swf':
        contentType = 'application/x-shockwave-flash';
        break;
        case '.flash':
        contentType = 'application/x-shockwave-flash';
        break;
      case '.flv':
        contentType = 'video/x-flv';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
      case '.ogg':
      case '.oga':
        contentType = 'audio/ogg';
        break;
      case '.opus':
        contentType = 'audio/opus';
        break;
      case '.flac':
        contentType = 'audio/flac';
        break;
      case '.m4a':
        contentType = 'audio/mp4';
        break;
      case '.aac':
        contentType = 'audio/aac';
        break;
      case '.eot':
        contentType = 'application/vnd.ms-fontobject';
        break;
      case '.atlas':
        contentType = 'application/octet-stream';
        break;
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.fnt':
        contentType = 'application/octet-stream';
        break;
      case '.min.js':
        contentType = 'application/javascript';
        break;
      case '.min.javascript':
        contentType = 'text/javascript';
        break;
      case '.min.css':
        contentType = 'text/css';
        break;
      case '.map':
        contentType = 'application/json';
        break;
      case '.java':
        contentType = 'text/plain';
        break;
        case '.gz':
        contentType = 'application/gzip';
        break;
        case '.unity3d':
        contentType = 'application/vnd.unity';
        break;
      default:
        contentType = contentType.replace(/; ?charset=utf-8/, '');
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    contentType,
    content,
  };
}

app.use(rewriteURLAndRedirect);

async function removeLeadingSlashFromAttributes(req, res, next) {
  if (!req.path.endsWith('.html')) {
    return next();
  }

  const originalContent = res.locals.fileContent;
  const modifiedContent = originalContent.replace(
    /(<(?:script|link|img|source)[^>]*(?:src|href|srcset)=["']?)\//g,
    '$1'
  );

  res.locals.fileContent = modifiedContent;
  next();
}

app.get('/cdn/:user/:repo/:branch/*', async (req, res) => {
  const { user, repo, branch } = req.params;
  const filePath = req.params[0];

  try {
    const githubUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
    const cacheKey = `${user}-${repo}-${branch}-${filePath}`;
    const cachedFile = fileCache.get(cacheKey);

    if (cachedFile) {
      res.setHeader('Cache-Control', 'public, max-age=600');
      res.writeHead(cachedFile.status, { 'Content-Type': cachedFile.contentType.split(';')[0] });
      res.end(cachedFile.content);
    } else {
      const response = await fetch(githubUrl);

      if (response.status === 404) {
        return res.sendStatus(404);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        res.setHeader('Content-Type', contentType);
        response.body.pipe(res);
      } else {
        const file = await fetchFile(githubUrl);
        fileCache.set(cacheKey, file);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.writeHead(file.status, { 'Content-Type': file.contentType.split(';')[0] });

        res.locals.fileContent = file.content;
        await removeLeadingSlashFromAttributes(req, res, () => {
          res.end(res.locals.fileContent);
        });
      }
    }
  } catch (e) {
    res.sendStatus(404);
    console.error(e);
  }
});


app.get('/jsdcdn/:user/:repo/:branch/*', async (req, res) => {
  const { user, repo, branch } = req.params;
  const filePath = req.params[0];

  try {
    const cloudflareCdnUrl = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${filePath}`;
    const response = await fetch(cloudflareCdnUrl);

    if (response.status === 404) {
      return res.sendStatus(404);
    }

    res.setHeader('Cache-Control', 'public, max-age=600');

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.startsWith('image/')) {
      res.setHeader('Content-Type', contentType);
      response.body.pipe(res);
    } else {
      const file = await fetchFile(cloudflareCdnUrl);
      res.writeHead(file.status, { 'Content-Type': file.contentType.split(';')[0] });
      res.end(file.content);
    }
  } catch (e) {
    res.sendStatus(404);
    console.error(e);
  }
});

app.get('/rgcdn/:user/:repo/:branch/*', async (req, res) => {
  const { user, repo, branch } = req.params;
  const filePath = req.params[0];

  try {
    const githackUrl = `https://raw.githack.com/${user}/${repo}/${branch}/${filePath}`;
    const cacheKey = `${user}-${repo}-${branch}-${filePath}`;
    const cachedFile = fileCache.get(cacheKey);

    if (cachedFile) {
      res.setHeader('Cache-Control', 'public, max-age=600');
      res.writeHead(cachedFile.status, { 'Content-Type': cachedFile.contentType.split(';')[0] });
      res.end(cachedFile.content);
    } else {
      const response = await fetch(githackUrl);

      if (response.status === 404) {
        return res.sendStatus(404);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        res.setHeader('Content-Type', contentType);
        response.body.pipe(res);
      } else {
        const file = await fetchFile(githackUrl);
        fileCache.set(cacheKey, file);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.writeHead(file.status, { 'Content-Type': file.contentType.split(';')[0] });

        res.locals.fileContent = file.content;
        await removeLeadingSlashFromAttributes(req, res, () => {
          res.end(res.locals.fileContent);
        });
      }
    }
  } catch (e) {
    res.sendStatus(404);
    console.error(e);
  }
});


 app.get('/rawgcdn/:user/:repo/:branch/*', async (req, res) => {
  const { user, repo, branch } = req.params;
  const filePath = req.params[0];

try {
    const rawgitUrl = `https://raw.rawgit.net/${user}/${repo}/${branch}/${filePath}`;
    const cacheKey = `${user}-${repo}-${branch}-${filePath}`;
    const cachedFile = fileCache.get(cacheKey);

    if (cachedFile) {
      res.setHeader('Cache-Control', 'public, max-age=600');
      res.writeHead(cachedFile.status, { 'Content-Type': cachedFile.contentType.split(';')[0] });
      res.end(cachedFile.content);
    } else {
      const response = await fetch(rawgitUrl);

      if (response.status === 404) {
        return res.sendStatus(404);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        res.setHeader('Content-Type', contentType);
        response.body.pipe(res);
      } else {
        const file = await fetchFile(rawgitUrl);
        fileCache.set(cacheKey, file);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.writeHead(file.status, { 'Content-Type': file.contentType.split(';')[0] });

        res.locals.fileContent = file.content;
        await removeLeadingSlashFromAttributes(req, res, () => {
          res.end(res.locals.fileContent);
        });
      }
    }
  } catch (e) {
    res.sendStatus(404);
    console.error(e);
  }
});

app.get('/gitcfcdn/:user/:repo/:branch/*', async (req, res) => {
  const { user, repo, branch } = req.params;
  const filePath = req.params[0];

  try {
    const gitcfUrl = `https://gh.maple3142.workers.dev/${user}/${repo}/${branch}/${filePath}`;
    const cacheKey = `${user}-${repo}-${branch}-${filePath}`;
    const cachedFile = fileCache.get(cacheKey);

    if (cachedFile) {
      res.setHeader('Cache-Control', 'public, max-age=600');
      res.writeHead(cachedFile.status, { 'Content-Type': cachedFile.contentType.split(';')[0] });
      res.end(cachedFile.content);
    } else {
      const response = await fetch(gitcfUrl);

      if (response.status === 404) {
        return res.sendStatus(404);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        res.setHeader('Content-Type', contentType);
        response.body.pipe(res);
      } else {
        const file = await fetchFile(gitcfUrl);
        fileCache.set(cacheKey, file);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.writeHead(file.status, { 'Content-Type': file.contentType.split(';')[0] });

        res.locals.fileContent = file.content;
        await removeLeadingSlashFromAttributes(req, res, () => {
          res.end(res.locals.fileContent);
        });
      }
    }
  } catch (e) {
    res.sendStatus(404);
    console.error(e);
  }
});

app.get('/staticallycdn/:user/:repo/:branch/*', async (req, res) => {
  const { user, repo, branch } = req.params;
  const filePath = req.params[0];

  try {
    const staticallyUrl = `https://cdn.statically.io/gh/${user}/${repo}/${branch}/${filePath}`;
    const cacheKey = `${user}-${repo}-${branch}-${filePath}`;
    const cachedFile = fileCache.get(cacheKey);

    if (cachedFile) {
      res.setHeader('Cache-Control', 'public, max-age=600');
      res.writeHead(cachedFile.status, { 'Content-Type': cachedFile.contentType.split(';')[0] });
      res.end(cachedFile.content);
    } else {
      const response = await fetch(staticallyUrl);

      if (response.status === 404) {
        return res.sendStatus(404);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        res.setHeader('Content-Type', contentType);
        response.body.pipe(res);
      } else {
        const file = await fetchFile(staticallyUrl);
        fileCache.set(cacheKey, file);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.writeHead(file.status, { 'Content-Type': file.contentType.split(';')[0] });

        res.locals.fileContent = file.content;
        await removeLeadingSlashFromAttributes(req, res, () => {
          res.end(res.locals.fileContent);
        });
      }
    }
  } catch (e) {
    res.sendStatus(404);
    console.error(e);
  }
});

const startLoadBalancer = require('./loadBalancer');
startLoadBalancer();

app.listen(port, () => {
  console.log(`CDN Server is listening!`);
});
