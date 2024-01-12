var http = require("http");
http
  .createServer(function (req, res) {
    res.write("Sword Uptime");
    res.end();
  })
  .listen(8080);
