import api from './services/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const status = await api.checkServerStatus();
  console.log('Status do servidor:', status);
});

const urlInput = document.getElementById('urlInput');
const addButton = document.getElementById('addButton');
// const checkNowButton = document.getElementById('checkNowButton'); // REMOVIDO
const siteList = document.getElementById('siteList');

let sites = [];

const loadSites = async () => {
  sites = await api.read('sites');
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
  // Nenhuma verificação imediata aqui
};

const renderSite = (site) => {
  const li = document.createElement('li');
  li.id = `site-${site.id}`;
  li.dataset.id = site.id;
  li.dataset.url = site.url;
  li.className = site.status;

  const textSpan = document.createElement('span');
  textSpan.textContent = `${site.url} - ${site.status}`;

  const editButton = document.createElement('button');
  editButton.textContent = '✏️';  // ícone lápis simples
  editButton.className = 'edit-btn';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Excluir';
  deleteButton.className = 'delete-btn';

  li.appendChild(textSpan);
  li.appendChild(editButton);
  li.appendChild(deleteButton);
  siteList.appendChild(li);

  // Função para entrar no modo edição
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
        li.dataset.url = formattedUrl; // Atualiza dataset também
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

addButton.addEventListener('click', () => {
  const url = urlInput.value.trim();
  addSite(url);
  urlInput.value = '';
});

loadSites();
