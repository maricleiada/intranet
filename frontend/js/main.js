// main.js
import Auth from './auth.js';
import Api from './services/api.js';


console.log("TOKEN EXISTENTE:", Auth.getToken());

// Elementos do DOM
const urlInput = document.getElementById('urlInput');
const addButton = document.getElementById('addButton');
const checkNowButton = document.getElementById('checkNowButton');
const logoutButton = document.getElementById('logoutButton');
const siteList = document.getElementById('siteList');

let sites = [];

// Logout
logoutButton.addEventListener('click', () => Auth.signout());

// Carrega todos os sites
async function loadSites() {
  try {
    sites = await Api.read('sites'); // usa /api/sites
    renderAllSites();
  } catch (err) {
    console.error('Erro ao carregar sites:', err);
    Auth.signout(); // se token inválido
  }
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

  editButton.addEventListener('click', () => startEdit(li, site, textSpan));
  deleteButton.addEventListener('click', () => deleteSite(site.id));
}

// Adicionar site
async function addSite(url) {
  if (!url) return;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }

  if (sites.some(s => s.url === url)) return;

  const newSite = { url, status: 'Verificando', lastChecked: new Date().toISOString() };

  try {
    const saved = await Api.create('sites', newSite);
    sites.push(saved);
    renderSite(saved);
  } catch (err) {
    console.error('Erro ao adicionar site:', err);
    Auth.signout();
  }
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
    if (!newUrl) { alert('URL não pode ser vazia'); input.focus(); return; }
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) newUrl = 'http://' + newUrl;

    const updatedSite = { ...site, url: newUrl, lastChecked: new Date().toISOString() };

    try {
      await Api.update(`sites/${site.id}`, updatedSite);
      site.url = newUrl;
      li.dataset.url = newUrl;
      textSpan.textContent = `${site.url} - ${site.status}`;
      li.replaceChild(textSpan, input);
    } catch (err) {
      console.error('Erro ao atualizar site:', err);
      Auth.signout();
    }
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
  try {
    await Api.remove(`sites/${id}`);
    sites = sites.filter(s => s.id !== id);
    const li = document.getElementById(`site-${id}`);
    if (li) li.remove();
  } catch (err) {
    console.error('Erro ao deletar site:', err);
    Auth.signout();
  }
}

// Checar status de todos os sites
async function checkAllSites() {
  try {
    const updatedSites = await Api.read('sites/check-status');
    sites = updatedSites;
    renderAllSites();
  } catch (err) {
    console.error('Erro ao checar status:', err);
    Auth.signout();
  }
}

// Eventos
addButton.addEventListener('click', () => {
  const url = urlInput.value.trim();
  addSite(url);
  urlInput.value = '';
});

checkNowButton.addEventListener('click', checkAllSites);

// Atualiza a cada 30 segundos
setInterval(checkAllSites, 30000);

// Inicializa a lista
loadSites().then(checkAllSites);
