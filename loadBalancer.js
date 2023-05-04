const http = require('http');
const httpProxy = require('http-proxy');
const express = require('express');
const port = process.env.PORT || 3005;

const proxy = httpProxy.createProxyServer({});
const targetServers = ['https://gitloaf-server-1.albios.repl.co', 'https://gitloaf-server-2.albios.repl.co', 'https://gitloaf-server-3.albios.repl.co', 'https://gitloaf-server-4.albios.repl.co'];

const server = http.createServer((req, res) => {
  const target = targetServers.shift();
  targetServers.push(target);

  proxy.web(req, res, { target });
});

function startLoadBalancer() {
  server.listen(port, () => {
    console.log(`Load balancer listening!`);
  });
}

module.exports = startLoadBalancer;