import api from './services/api.js';

const urlInput = document.getElementById('urlInput');
const addButton = document.getElementById('addButton');
const checkNowButton = document.getElementById('checkNowButton'); // botão para verificar status
const siteList = document.getElementById('siteList');

let sites = [];

const loadSites = async () => {
  sites = await api.read('sites');
  siteList.innerHTML = ''; // Limpa a lista antes de renderizar
  sites.forEach(site => renderSite(site));
};

const addSite = async (url) => {
  if (!url) return;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }

  const exists = sites.find(site => site.url === url);
  if (exists) return;

  const newSite = {
    url,
    status: 'Verificando',
    lastChecked: new Date().toISOString()
  };

  const saved = await api.create('sites', newSite);
  sites.push(saved);
  renderSite(saved);
  // Pode chamar checkAllSites() aqui se quiser verificação imediata
};

const renderSite = (site) => {
  const li = document.createElement('li');
  li.id = `site-${site.id}`;
  li.dataset.id = site.id;
  li.dataset.url = site.url;
  li.className = site.status.toLowerCase(); // para css, ex: "ativo", "inativo"

  const textSpan = document.createElement('span');
  textSpan.textContent = `${site.url} - ${site.status}`;

  const editButton = document.createElement('button');
  editButton.textContent = '✏️';
  editButton.className = 'edit-btn';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Excluir';
  deleteButton.className = 'delete-btn';

  li.appendChild(textSpan);
  li.appendChild(editButton);
  li.appendChild(deleteButton);
  siteList.appendChild(li);

  const startEdit = () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = site.url;
    input.className = 'edit-input';

    li.replaceChild(input, textSpan);
    input.focus();

    const saveEdit = async () => {
      const newUrl = input.value.trim();
      if (!newUrl) {
        alert('URL não pode ser vazia');
        input.focus();
        return;
      }

      let formattedUrl = newUrl;
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'http://' + formattedUrl;
      }

      try {
        const updatedSite = {
          ...site,
          url: formattedUrl,
          lastChecked: new Date().toISOString(),
        };
        await api.update(`sites/${site.id}`, updatedSite);

        site.url = formattedUrl;
        li.dataset.url = formattedUrl;
        textSpan.textContent = `${site.url} - ${site.status}`;
        li.replaceChild(textSpan, input);
      } catch (err) {
        alert('Erro ao atualizar site');
        console.error(err);
      }
    };

    const cancelEdit = () => {
      li.replaceChild(textSpan, input);
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEdit();
      else if (e.key === 'Escape') cancelEdit();
    });

    input.addEventListener('blur', () => {
      cancelEdit();
    });
  };

  editButton.addEventListener('click', startEdit);

  deleteButton.addEventListener('click', () => deleteSite(site.id));
};

const deleteSite = async (id) => {
  const resource = `sites/${id}`;
  await api.remove(resource);
  sites = sites.filter(site => site.id !== id);
  const li = document.getElementById(`site-${id}`);
  if (li) li.remove();
};

// Função para checar status de todos os sites no backend e atualizar a UI
async function checkAllSites() {
  const updatedSites = await api.read('sites/check-status');
  sites = updatedSites;
  siteList.innerHTML = ''; // limpa a lista atual
  sites.forEach(site => renderSite(site));
}

addButton.addEventListener('click', () => {
  const url = urlInput.value.trim();
  addSite(url);
  urlInput.value = '';
});

checkNowButton.addEventListener('click', () => {
  checkAllSites();
});

// Atualiza os sites a cada 30 segundos
setInterval(() => {
  console.log('Verificando status dos sites...');
  checkAllSites();
}, 30000); // 30000 ms = 30 segundos


// Carrega os sites e já exibe
loadSites();

// Carrega os sites e depois checa status
loadSites().then(checkAllSites);
