import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; // troque em produção

// Registrar usuário
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    // opcional: força um mínimo de senha
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.status(409).json({ message: 'Usuário já existe. Faça login.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hash }
    });

    return res.status(201).json({ message: 'Conta criada com sucesso.', userId: user.id });
  } catch (err) {
    // Trata unique constraint do Prisma
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Usuário já existe. Faça login.' });
    }
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Erro no servidor ao registrar.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ message: 'Autenticado com sucesso.', token });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Erro no servidor ao autenticar.' });
  }
});

export default router;
