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
    const ext = path.extname(url).slice(1);
    contentType = mime[ext] || 'text/plain';
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

app.listen(port, () => {
  console.log(`CDN Server is listening!`);
});