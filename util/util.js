const crypto = require('crypto');
const pool = require('./db.js');
const named = require('node-postgres-named');
const request = require('request-promise-native');
const headersOpt = {
  'content-type': 'application/json',
};

module.exports = {
  generateKey: () => {
    let sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
  },

  transactionWrapper: async (fn) => {
    const client = await pool.connect();
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
  },

  sendRPC: async (endpoint, method, params, id = 1) => {
    await request({
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
  },
};
