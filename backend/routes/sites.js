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
    const res = await fetch(url, { method: 'HEAD' }); // removido timeout
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
      data: {
        url,
        status: 'Verificando',
        lastChecked: new Date(),
        userId: req.user.id // corrigido
      },
    });
    res.json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar site' });
  }
});

// READ
router.get('/', async (req, res) => {
  try {
    const sites = await prisma.site.findMany({ where: { userId: req.user.id } });
    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar sites' });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const site = await prisma.site.update({
      where: { id, userId: req.user.id }, // garante que pertence ao usuário
      data: req.body,
    });
    res.json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar site' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.site.delete({ where: { id, userId: req.user.id } }); // verifica dono
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar site' });
  }
});

// CHECK STATUS
router.get('/check-status', async (req, res) => {
  try {
    const sites = await prisma.site.findMany({ where: { userId: req.user.id } });
    for (const site of sites) {
      const status = await checkSiteStatus(site.url);
      await prisma.site.update({
        where: { id: site.id },
        data: { status, lastChecked: new Date() },
      });
      site.status = status;
    }
    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao checar status' });
  }
});

export default router;
