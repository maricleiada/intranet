const urlInput = document.getElementById('urlInput');
const addButton = document.getElementById('addButton');
const checkNowButton = document.getElementById('checkNowButton');
const siteList = document.getElementById('siteList');

let sites = [];

// Adiciona site na lista
const addSite = (url) => {
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }

    if (!sites.includes(url)) {
        sites.push(url);
        renderSite(url);
    }
};

// Renderiza o site na tela e inicia verificação
const renderSite = (url) => {
    const li = document.createElement('li');
    li.textContent = `${url} - Verificando...`;
    li.classList.add('checking');
    li.dataset.url = url;
    siteList.appendChild(li);
    checkSiteStatus(url, li);
};

// Verifica status de um site individual
const checkSiteStatus = async (url, li) => {
    try {
        const response = await fetch(`/check?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        li.className = data.status === 'online' ? 'online' : 'offline';

        let displayHostname = data.hostname ? `Hostname: ${data.hostname}, ` : '';
        let ip = data.ip || 'indefinido';
        let responseTime = data.responseTime !== undefined ? `${data.responseTime} ms` : '?';

        li.textContent = `${url} - ${data.status.toUpperCase()} (${displayHostname}IP: ${ip}, Tempo de resposta: ${responseTime})`;

        if (data.error) {
            li.textContent += ` - Erro: ${data.error}`;
        }
    } catch (error) {
        li.className = 'offline';
        li.textContent = `${url} - Offline (erro: ${error.message})`;
    }
};

// Verifica todos os sites
const checkAllSites = () => {
    const listItems = siteList.querySelectorAll('li');
    listItems.forEach(li => {
        const url = li.dataset.url;
        if (url) {
            checkSiteStatus(url, li);
        }
    });
};

// Eventos
addButton.addEventListener('click', () => {
    const url = urlInput.value.trim();
    addSite(url);
    urlInput.value = '';
});

checkNowButton.addEventListener('click', () => {
    checkAllSites();
});

// Verificação automática a cada 30s
setInterval(checkAllSites, 30000);
