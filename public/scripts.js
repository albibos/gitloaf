const cdnBaseUrl = `${window.location.origin}/cdn`;
const cfcdnBaseUrl = `${window.location.origin}/jsdcdn`;
const rgcdnBaseUrl = `${window.location.origin}/rgcdn`;
const rawgcdnBaseUrl = `${window.location.origin}/rawgcdn`;
const gitcfBaseUrl = `${window.location.origin}/gitcfcdn`;
const staticallyBaseUrl = `${window.location.origin}/staticallycdn`;

document.getElementById('url-converter').addEventListener('submit', (event) => {
    event.preventDefault();

    const githubUrl = document.getElementById('github-url').value;
    const defaultCdnUrl = convertToCdnUrl(githubUrl, cdnBaseUrl);
    const jsdelivrCdnUrl = convertToCdnUrl(githubUrl, cfcdnBaseUrl);
    const rawgithackCdnUrl = convertToCdnUrl(githubUrl, rgcdnBaseUrl);
    const rawgitCdnUrl = convertToCdnUrl(githubUrl, rawgcdnBaseUrl);
    const gitcfCdnUrl = convertToCdnUrl(githubUrl, gitcfBaseUrl);
    const staticallyCdnUrl = convertToCdnUrl(githubUrl, staticallyBaseUrl);

    if (defaultCdnUrl && jsdelivrCdnUrl && rawgithackCdnUrl) {
        document.getElementById('converted-url').value = defaultCdnUrl;
        document.getElementById('converted-jsdelivr-url').value = jsdelivrCdnUrl;
      document.getElementById('converted-githack-url').value = rawgithackCdnUrl;
      document.getElementById('converted-rawgit-url').value = rawgitCdnUrl;
      document.getElementById('converted-gitcf-url').value = gitcfCdnUrl;
      document.getElementById('converted-statically-url').value = staticallyCdnUrl;
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
