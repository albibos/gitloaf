const cdnBaseUrl = `${window.location.origin}/cdn`;
const cfcdnBaseUrl = `${window.location.origin}/jsdcdn`;
const rgcdnBaseUrl = `${window.location.origin}/rgcdn`;

document.getElementById('url-converter').addEventListener('submit', (event) => {
    event.preventDefault();

    const githubUrl = document.getElementById('github-url').value;
    const defaultCdnUrl = convertToCdnUrl(githubUrl, cdnBaseUrl);
    const jsdelivrCdnUrl = convertToCdnUrl(githubUrl, cfcdnBaseUrl);
    const rawgithackCdnUrl = convertToCdnUrl(githubUrl, rgcdnBaseUrl);

    if (defaultCdnUrl && jsdelivrCdnUrl && rawgithackCdnUrl) {
        document.getElementById('converted-url').value = defaultCdnUrl;
        document.getElementById('converted-jsdelivr-url').value = jsdelivrCdnUrl;
      document.getElementById('converted-githack-url').value = rawgithackCdnUrl;
    } else {
        alert('Invalid GitHub URL');
    }
});

function convertToCdnUrl(githubUrl, baseUrl) {
    const regex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;

    if (!regex.test(githubUrl)) {
        return null;
    }

    const [, user, repo, branch, filePath] = regex.exec(githubUrl);
    return `${baseUrl}/${user}/${repo}/${branch}/${filePath}`;
}
