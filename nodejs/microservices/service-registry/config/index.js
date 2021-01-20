const bunyan = require ('bunyan');
const pjs = require ('../package.json');

const { name, version } = pjs;
const getLogger = (serviceName, serviceVersion, level) => bunyan.createLogger({name: `${serviceName}:${serviceVersion}`, level});

module.exports = {
    developement: {
        name,
        version,
        serviceTimeOut: 30,
        log: () => getLogger(name, version, 'debug')
    },
    production: {
        name,
        version,
        serviceTimeOut: 30,
        log: () => getLogger(name, version, 'info')
    },
    test: {
        name,
        version,
        serviceTimeOut: 30,
        log: () => getLogger(name, version, 'fatal')
    }
};