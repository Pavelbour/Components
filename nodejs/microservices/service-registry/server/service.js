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

    service.put('/register/:servicename/:serviceversion/:serviceport', (req, res) => {
        const {servicename, serviceversion, serviceport} = req.params;
        console.log(req.params, servicename, serviceversion, serviceport);
        const serviceip = req.ip.includes('::') ? `[${req.ip}]` : req.ip;
        const serviceKey = serviceRegistry.register(servicename, serviceversion, serviceip, serviceport);

        return res.json({result: serviceKey});
    });

    service.delete('unregister/:servicename/:serviceversion/:serviceport', (req, res) => {
        const {servicename, serviceversion, serviceport} = req.params;
        console.log(req.params, servicename, serviceversion, serviceport);
        const serviceip = req.ip.includes('::') ? `[${req.ip}]` : req.ip;
        const serviceKey = serviceRegistry.unregister(servicename, serviceversion, serviceip, serviceport);

        return res.json({result: `Deleted ${serviceKey}`});
    });

    service.get('find/register/:servicename/:serviceversion/', (req, res, next) => {
        return next('Not Implemented');
    });

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