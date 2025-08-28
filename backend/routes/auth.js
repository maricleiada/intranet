import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// 📌 Registrar usuário
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name?.trim() || !username?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.status(409).json({ message: 'Usuário já existe. Faça login.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, username, email, password: hash }
    });

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({ message: 'Conta criada com sucesso.', token });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Erro no servidor ao registrar.' });
  }
});

// 📌 Login do usuário
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ message: 'Login bem-sucedido.', token });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Erro no servidor ao fazer login.' });
  }
});

export default router;
