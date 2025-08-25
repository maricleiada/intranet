// main.js - lógica de UI para CRUD de sites
import Api from './services/api.js';
import Auth from './auth.js';

// Garante que só usuários autenticados acessem a página
Auth.isAuthenticated();

const urlInput = document.getElementById('urlInput');
const addButton = document.getElementById('addButton');
const checkNowButton = document.getElementById('checkNowButton');
const siteList = document.getElementById('siteList');

let sites = [];

// Carrega todos os sites do usuário
async function loadSites() {
  sites = await Api.read('sites');
  renderAllSites();
}

// Renderiza todos os sites
function renderAllSites() {
  siteList.innerHTML = '';
  sites.forEach(renderSite);
}

// Renderiza um site individual
function renderSite(site) {
  const li = document.createElement('li');
  li.id = `site-${site.id}`;
  li.dataset.id = site.id;
  li.dataset.url = site.url;
  li.className = site.status.toLowerCase();

  const textSpan = document.createElement('span');
  textSpan.textContent = `${site.url} - ${site.status}`;

  const editButton = document.createElement('button');
  editButton.textContent = '✏️';
  editButton.className = 'edit-btn';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Excluir';
  deleteButton.className = 'delete-btn';

  li.append(textSpan, editButton, deleteButton);
  siteList.appendChild(li);

  // Editar site
  editButton.addEventListener('click', () => startEdit(li, site, textSpan));

  // Deletar site
  deleteButton.addEventListener('click', () => deleteSite(site.id));
}

// Função para adicionar site
async function addSite(url) {
  if (!url) return;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }

  if (sites.some(s => s.url === url)) return;

  const newSite = {
    url,
    status: 'Verificando',
    lastChecked: new Date().toISOString()
  };

  const saved = await Api.create('sites', newSite);
  sites.push(saved);
  renderSite(saved);
}

// Editar site
function startEdit(li, site, textSpan) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = site.url;
  input.className = 'edit-input';

  li.replaceChild(input, textSpan);
  input.focus();

  const saveEdit = async () => {
    let newUrl = input.value.trim();
    if (!newUrl) {
      alert('URL não pode ser vazia');
      input.focus();
      return;
    }
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'http://' + newUrl;
    }

    const updatedSite = { ...site, url: newUrl, lastChecked: new Date().toISOString() };
    await Api.update(`sites/${site.id}`, updatedSite);

    site.url = newUrl;
    li.dataset.url = newUrl;
    textSpan.textContent = `${site.url} - ${site.status}`;
    li.replaceChild(textSpan, input);
  };

  const cancelEdit = () => li.replaceChild(textSpan, input);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    else if (e.key === 'Escape') cancelEdit();
  });

  input.addEventListener('blur', cancelEdit);
}

// Deletar site
async function deleteSite(id) {
  await Api.remove(`sites/${id}`);
  sites = sites.filter(site => site.id !== id);
  const li = document.getElementById(`site-${id}`);
  if (li) li.remove();
}

// Checar status de todos os sites
async function checkAllSites() {
  const updatedSites = await Api.read('sites/check-status');
  sites = updatedSites;
  renderAllSites();
}

// Eventos
addButton.addEventListener('click', () => {
  const url = urlInput.value.trim();
  addSite(url);
  urlInput.value = '';
});

checkNowButton.addEventListener('click', checkAllSites);

// Atualiza os sites a cada 30 segundos
setInterval(checkAllSites, 30000);

// Inicializa a lista
loadSites().then(checkAllSites);
