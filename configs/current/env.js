var numCPUs = require('os').cpus().length;

module.exports = {
    port: 8080,
    workersCount: numCPUs > 2 ? 2: numCPUs,
    debug: true,
    hotReload: true
};
