const crypto = require('crypto');
const named = require('node-postgres-named');
const request = require('request-promise-native');

const db = require('./db.js');

const headersOpt = {
  'content-type': 'application/json',
};

const generateKey = () => {
  let sha = crypto.createHash('sha256');
  sha.update(Math.random().toString());

  return sha.digest('hex');
};

const transaction = async (fn) => {
  const client = await db.connect();
  named.patch(client);

  try {
    await client.query('BEGIN');
    await fn(client);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.release();
  }
};

const sendRPC = async (endpoint, method, params, id = 1) => {
  return request({
    method: 'post',
    url: endpoint,
    body: `{
        "jsonrpc": "2.0",
        "method": "${method}",
        "params": ${JSON.stringify(params)},
        "id": ${id}
      }`,
    headers: headersOpt,
  });
};

module.exports = {
  generateKey,
  transaction,
  sendRPC,
};
