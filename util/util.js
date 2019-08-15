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

const sortArrayBy = (field, reverse, pr) => {
  reverse = (reverse) ? -1 : 1;

  return function (a, b) {
    a = a[field];
    b = b[field];

    if (typeof (pr) !== 'undefined') {
      a = pr(a);
      b = pr(b);
    }

    if (a < b) return reverse * -1;
    if (a > b) return reverse * 1;

    return 0;
  };
};

module.exports = {
  generateKey,
  transaction,
  sendRPC,
  sortArrayBy,
};
