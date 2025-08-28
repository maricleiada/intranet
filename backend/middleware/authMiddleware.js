import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token ausente' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = { id: decoded.sub, username: decoded.username }; // compatível com sites.js
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export default authenticate;
