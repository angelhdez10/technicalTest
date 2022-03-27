import jwt from 'jsonwebtoken';

const createToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: '1d',
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

export default createToken;
