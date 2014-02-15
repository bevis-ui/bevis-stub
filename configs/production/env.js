var numCPUs = require('os').cpus().length;
var path = require('path');

module.exports = {
    socket: '/tmp/' + path.basename(process.cwd()) + '-' + process.argv[2] + '.socket',
    workersCount: numCPUs > 2  ? 2: numCPUs,
    debug: false,
    hotReload: false
};
