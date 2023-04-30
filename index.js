const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

function rewriteURLAndRedirect(req, res, next) {
  const user = '3kh0';
  const repo = '3kh0-Assets';
  const branch = 'main';

  if (req.path.startsWith('/js/') || req.path.startsWith('/css/')) {
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
        contentType = 'text/html';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'application/javascript';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.xml':
        contentType = 'application/xml';
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
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.csv':
        contentType = 'text/csv';
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

app.get('/cdn/:user/:repo/:branch/*', async (req, res) => {
  const { user, repo, branch } = req.params;
  const filePath = req.params[0];

  try {
    const githubUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
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

      res.writeHead(file.status, { 'Content-Type': file.contentType.split(';')[0] });
      res.end(file.content);
    }
  } catch (e) {
    res.sendStatus(404);
    console.error(e);
  }
});

app.listen(port, () => {
  console.log(`CDN server listening at http://localhost:${port}`);
});
