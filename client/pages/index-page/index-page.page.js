module.exports = function (pages) {
    pages.declare('index-page', function (params) {
        var options = params.options;
        return {
            block: 'page',
            title: 'Index page',
            styles: [
                {url: options.assetsPath + '.css'}
            ],
            scripts: [
                {url: options.assetsPath + '.' + params.lang + '.js'}
            ],
            body: []
        };
    });
};
