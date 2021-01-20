const express = require('express');
const ServiceRegistry = require('./lib/ServiceRegistry');

const service = express();

module.exports = config => {
    const log = config.log();
    const serviceRegistry = new ServiceRegistry(log);

    if (service.get('env') === 'development') {
        service.use((req, res, next) => {
            log.debug(`${req.method}: ${req.url}`);
            return next();
        });
    }


    service.use((error, req, res, next) => {
        res.status(error.status || 500);
        log.error(error);
        return res.json({
            error: {
                message: error.message
            }
        });
    });
    return service;
}