'use strict';
const httpStatus = require('http-status-codes'),
    utils = require('./utils'),
    contentTypes = require('./contentTypes');
    
const routes = {
    'GET': {}
};

exports.handle = (req, res) => {
    try {
        routes[req.method][req.url](req, res);
    } catch (e) {
        res.writeHead(httpStatus.StatusCodes.OK, contentTypes.html);
        utils.getFile('views/error.html', res);
    }
};

exports.get = (url, action) => {
    routes['GET'][url] = action;
};