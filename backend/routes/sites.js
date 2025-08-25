import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';

import fetch from 'node-fetch';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

// Função para checar status de site
async function checkSiteStatus(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', timeout: 5000 });
    return res.ok ? 'Ativo' : 'Inativo';
  } catch {
    return 'Inativo';
  }
}

// CREATE
router.post('/', async (req, res) => {
  const { url } = req.body;
  try {
    const site = await prisma.site.create({
      data: { url, status: 'Verificando', lastChecked: new Date(), userId: req.userId },
    });
    res.json(site);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar site' });
  }
});

// READ
router.get('/', async (req, res) => {
  const sites = await prisma.site.findMany({ where: { userId: req.userId } });
  res.json(sites);
});

// UPDATE
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const site = await prisma.site.update({
      where: { id },
      data: req.body,
    });
    res.json(site);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar site' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.site.delete({ where: { id } });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar site' });
  }
});

// CHECK STATUS
router.get('/check-status', async (req, res) => {
  const sites = await prisma.site.findMany({ where: { userId: req.userId } });
  for (const site of sites) {
    const status = await checkSiteStatus(site.url);
    await prisma.site.update({
      where: { id: site.id },
      data: { status, lastChecked: new Date() },
    });
    site.status = status;
  }
  res.json(sites);
});

export default router;
