module.exports = {
  rawBody: (req, res, next) => {
    req.setEncoding('utf8');
    req.rawBody = '';
    req.on('data', (chunk) => {
      req.rawBody += chunk;
    });
    req.on('end', () => {
      next();
    });
  },
  cors: (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'content-type');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    next();
  },
};
