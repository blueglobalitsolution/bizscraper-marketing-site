const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    console.log('BROWSER_LOG:', body);
    res.end('ok');
    if (body.includes('TEST_COMPLETE')) {
      setTimeout(() => process.exit(0), 1000);
    }
  });
});
server.listen(9876, () => console.log('Log collector ready on 9876'));
