import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h', // ⭐ CRITICAL FIX: Reduced from 30d to 24h
  });
};

export default generateToken;
