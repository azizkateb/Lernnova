const crypto = require('crypto');

const generateRawToken = () => crypto.randomBytes(32).toString('hex');

const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

module.exports = { generateRawToken, hashToken };
