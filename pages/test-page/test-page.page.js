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
                {url: options.assetsPath + '.js'}
            ],
            body: [
                {
                    block: 'input',
                    view: 'large',
                    value: 'Привет, Бивис',
                    name: 'loginField',
                    placeholder: 'Инпут на сайте'
                }
            ]
        };
    });
};
