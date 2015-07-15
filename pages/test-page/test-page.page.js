module.exports = function (pages) {
    pages.declare('test-page', function (params) {
        var options = params.options;
        return {
            block: 'page',
            title: 'test page',
            styles: [
                {url: options.assetsPath + '.css'}
            ],
            scripts: [
                {url: options.assetsPath + '.' + params.lang + '.js'}
            ],
            body: [
                {
                    block: 'input',
                    view: 'small',
                    value: 'Hello',
                    name: 'loginField',
                    placeholder: 'на сайте'
                }
            ]
        };
    });
};
