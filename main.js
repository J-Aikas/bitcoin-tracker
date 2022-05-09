'use strict';
const port = 3000,
    http = require('http'),
    httpStatus = require('http-status-codes'),
    router = require('./router'),
    contentTypes = require('./contentTypes'),
    utils = require('./utils');

router.get('/index.html', (req, res) => {
    res.writeHead(httpStatus.StatusCodes.OK, contentTypes.html);
    utils.getFile('views/index.html', res);
});

router.get('/coin.png', (req, res) => {
    res.writeHead(httpStatus.StatusCodes.OK, contentTypes.png);
    utils.getFile('public/images/coin.png', res);
});

router.get('/style.css', (req, res) => {
    res.writeHead(httpStatus.StatusCodes.OK, contentTypes.css);
    utils.getFile('public/css/style.css', res);
});

router.get('/eventListeners.js', (req, res) => {
    res.writeHead(httpStatus.StatusCodes.OK, contentTypes.js);
    utils.getFile('public/js/eventListeners.js', res);
});

router.get('/dataHandleFunctions.js', (req, res) => {
    res.writeHead(httpStatus.StatusCodes.OK, contentTypes.js);
    utils.getFile('public/js/dataHandleFunctions.js', res);
});

http.createServer(router.handle).listen(port);
console.log(`The server is listening to port: ${port}`);