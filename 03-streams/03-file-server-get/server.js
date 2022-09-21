const http = require('http');
const path = require('path');
const {access} = require('node:fs/promises');
const {createReadStream} = require('node:fs');

const server = new http.Server();

server.on('request', async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      const pathSize = pathname.split('/').filter(Boolean).length;

      if (pathSize > 1) {
        res.statusCode = 400;
        res.end();
        return;
      }

      try {
        await access(filepath);
      } catch (error) {
        res.statusCode = 404;
        res.end();
        return;
      };

      const readStream = createReadStream(filepath);

      readStream.pipe(res);

      readStream.on('error', () => {
        res.statusCode = 500;
        res.end();
        return;
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
