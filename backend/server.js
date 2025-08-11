import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // npm install node-fetch@2
import db from './db.js';       // sua conexão com SQLite

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend')); // ajuste o caminho conforme seu frontend

// Função para checar status do site via HTTP HEAD
async function checkSiteStatus(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', timeout: 5000 });
    if (res.ok) {
      return 'Ativo';
    }
    return 'Inativo';
  } catch {
    return 'Inativo';
  }
}

// CREATE - POST /sites
app.post('/sites', async (req, res) => {
  try {
    const [id] = await db('sites').insert({
      url: req.body.url,
      status: req.body.status || 'Verificando',
      lastChecked: req.body.lastChecked || new Date().toISOString(),
    });
    const site = await db('sites').where({ id }).first();
    res.status(201).json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar site' });
  }
});

// READ - GET /sites
app.get('/sites', async (req, res) => {
  try {
    const sites = await db('sites').select('*');
    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar sites' });
  }
});

// UPDATE - PUT /sites/:id
app.put('/sites/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const count = await db('sites').where({ id }).update(req.body);
    if (count === 0) {
      return res.status(404).json({ error: 'Site não encontrado' });
    }
    const site = await db('sites').where({ id }).first();
    res.json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar site' });
  }
});

// DELETE - DELETE /sites/:id
app.delete('/sites/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const count = await db('sites').where({ id }).del();
    if (count === 0) {
      return res.status(404).json({ error: 'Site não encontrado' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar site' });
  }
});

// Rota para verificar status e atualizar todos os sites
app.get('/sites/check-status', async (req, res) => {
  try {
    const sites = await db('sites').select('*');
    for (const site of sites) {
      const status = await checkSiteStatus(site.url);
      await db('sites').where({ id: site.id }).update({
        status,
        lastChecked: new Date().toISOString(),
      });
      site.status = status; // Atualiza objeto para enviar na resposta
    }
    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao verificar status dos sites' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
