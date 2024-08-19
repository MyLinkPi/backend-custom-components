const crypto = require('node:crypto');
const hex = /^[0-9a-f]+$/;
const HEX = /^[0-9A-F]+$/;
const Is_HEX = (s, l) => typeof s === 'string' && s.length === l && HEX.test(s);
const Is_hex = (s, l) => typeof s === 'string' && s.length === l && hex.test(s);
const IsNodeId = (s) => Is_hex(s, 32) || Is_hex(s, 12);
const IsAccountId = (s) => Is_HEX(s, 32);
const IsAccountToken = (s) => Is_HEX(s, 32) || Is_HEX(s, 64);
const IsTempId = IsAccountId;

function sha512(a, encoding = 'hex') {
  const hash = crypto.createHash('sha512');
  hash.update(a);
  return hash.digest(encoding);
}

function generateId(len = 16) {
  const buf = Buffer.allocUnsafe(len);
  crypto.randomFillSync(buf);
  return buf.toString('hex');
}

function md5(a, encoding = 'hex') {
  const hash = crypto.createHash('md5');
  hash.update(a);
  return hash.digest(encoding);
}

module.exports = { IsNodeId, IsAccountId, IsAccountToken, IsTempId, sha512, generateId, md5 };
