function getUrlFromRequest({ query, jiraUrl, ticketNumber } = {}) {
    switch (query) {
        case 'getSession':
            return `https://${jiraUrl}/rest/auth/1/session`;
        case 'getTicketInfo':
            return `https://${jiraUrl}/rest/api/latest/issue/${ticketNumber}`;
        default:
            throw new Error(`Invalid request: ${query}`);
    }
}

async function processRequest(url, sendResponse) {
    try {
        try {
            const response = await fetch(url, { headers: { accept: 'application/json' } })
            sendResponse(await response.json());
        } catch (e) {
            console.error(`Failed to fetch: ${e.message}`);
        }
    } catch(e) {
        console.error(e.message);
    }
}

async function processImageToData(url, sendResponse) {
    try {
        sendResponse(await toDataURL(url));
    } catch (e) {
        console.log(`Failed to fetch & process image url: ${e.message}`);
    }
}

async function toDataURL(url) {
    return fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        }));
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.method) {
        case 'imageToData':
            processImageToData(request.url || null, sendResponse);
            break;
        case 'request':
        default:
            processRequest(getUrlFromRequest(request), sendResponse)
    }
    return true;
});
