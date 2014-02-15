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
                {url: options.assetsPath + '.js'}
            ],
            body: [
                {
                    block: 'layout',
                    aside: {
                        block: 'sidebar',

                        title: 'Привет, BEViS!',
                        resources: [
                            {
                                text: 'Репозиторий',
                                url: 'https://github.com/bevis-ui/'
                            },
                            {
                                text: 'Учебник для новичков',
                                url: 'https://github.com/bevis-ui/docs/blob/master/manual-for-beginner.md'
                            },
                            {
                                text: 'Учебник для старичков',
                                url: 'https://github.com/bevis-ui/docs/blob/master/manual-for-master.md'
                            },
                        ]
                    }
                }
            ]
        };
    });
};
