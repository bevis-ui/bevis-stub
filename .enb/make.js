module.exports = function (config) {
    config.setLanguages(['ru']);

    config.nodes('build/*');

    config.nodeMask(/^build\/.*$/, function (nodeConfig) {
        nodeConfig.addTechs([
            [require('enb/techs/levels'), {levels: getLevels()}],
            [require('enb/techs/file-provider'), {target: '?.bemdecl.js'}],
            require('enb-modules/techs/deps-with-modules'),
            require('enb/techs/files'),
            require('enb-stylus/techs/css-stylus-with-autoprefixer'),
            require('enb-bt/techs/bt-server'),
            [require('enb/techs/js'), {target: '?.pre.js'}],
            [require('enb-modules/techs/prepend-modules'), {source : '?.pre.js', target: '?.js'}],
            require('./techs/page')
        ]);
        nodeConfig.addTargets(["_?.js", "_?.css"]);

        nodeConfig.mode('development', function(nodeConfig) {
            nodeConfig.addTechs([
                [require('enb/techs/file-copy'), {sourceTarget: '?.js', destTarget: '_?.js'}],
                [require('enb/techs/file-copy'), {sourceTarget: '?.css', destTarget: '_?.css'}]
           ]);
        });

        nodeConfig.mode('production', function(nodeConfig) {
            nodeConfig.addTechs([
                [require('enb/techs/borschik'), {sourceTarget: '?.js', destTarget: '_?.js'}],
                [require('enb/techs/borschik'), {sourceTarget: '?.css', destTarget: '_?.css', freeze: 'yes'}]
           ]);
        });
    });

    function getLevels() {
        return [
            'core',
            'blocks',
            'pages'
        ].map(config.resolvePath.bind(config));
    }
};
