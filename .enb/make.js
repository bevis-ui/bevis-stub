var fs = require('fs');
var path = require('path');

module.exports = function (config) {

    config.setLanguages(['ru', 'en']);

    config.includeConfig('enb-bevis-helper');

    var bevisHelper = config.module('enb-bevis-helper')
        .browserSupport([
            'IE >= 9',
            'Safari >= 5',
            'Chrome >= 33',
            'Opera >= 12.16',
            'Firefox >= 28'
        ])
        .useAutopolyfiller();

    fs.readdirSync('client/pages').forEach(function(pageName) {
        var nodeName = pageName.replace(/(.*?)\-page/, path.join('build', '$1'));

        config.node(nodeName, function (nodeConfig) {

            bevisHelper
                .sourceDeps(pageName)
                .sources({profile: pageName})
                .forServerPage()
                .configureNode(nodeConfig);

            nodeConfig.addTech(require('./techs/page'));
            nodeConfig.addTarget('?.page.js');
        });

    });

};