const cdnBaseUrl = `${window.location.origin}/cdn`;

document.getElementById('url-converter').addEventListener('submit', (event) => {
    event.preventDefault();

    const githubUrl = document.getElementById('github-url').value;
    const convertedUrl = convertToCdnUrl(githubUrl);

    if (convertedUrl) {
        document.getElementById('converted-url').value = convertedUrl;
    } else {
        alert('Invalid GitHub URL');
    }
});

function convertToCdnUrl(githubUrl) {
    const regex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;

    if (!regex.test(githubUrl)) {
        return null;
    }

    const [, user, repo, branch, filePath] = regex.exec(githubUrl);
    return `${cdnBaseUrl}/${user}/${repo}/${branch}/${filePath}`;
}
