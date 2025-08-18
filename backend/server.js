// server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // npm install node-fetch@2
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend')); // caminho do frontend, ajuste se necessário

// Função para checar status do site via HTTP HEAD
async function checkSiteStatus(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', timeout: 5000 });
    return res.ok ? 'Ativo' : 'Inativo';
  } catch {
    return 'Inativo';
  }
}

// CREATE - Adicionar site
app.post('/sites', async (req, res) => {
  try {
    const site = await prisma.site.create({
      data: {
        url: req.body.url,
        status: req.body.status || 'Verificando',
        lastChecked: req.body.lastChecked || new Date(),
      },
    });
    res.status(201).json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar site' });
  }
});

// READ - Listar sites
app.get('/sites', async (req, res) => {
  try {
    const sites = await prisma.site.findMany();
    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar sites' });
  }
});

// UPDATE - Atualizar site
app.put('/sites/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const site = await prisma.site.update({
      where: { id },
      data: req.body,
    });
    res.json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar site' });
  }
});

// DELETE - Deletar site
app.delete('/sites/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.site.delete({ where: { id } });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar site' });
  }
});

// Verificar status de todos os sites
app.get('/sites/check-status', async (req, res) => {
  try {
    const sites = await prisma.site.findMany();
    for (const site of sites) {
      const status = await checkSiteStatus(site.url);
      await prisma.site.update({
        where: { id: site.id },
        data: { status, lastChecked: new Date() },
      });
      site.status = status; // Atualiza objeto para resposta
    }
    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao verificar status dos sites' });
  }
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
