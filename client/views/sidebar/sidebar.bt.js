module.exports = function (bt) {

    bt.match('sidebar', function (ctx) {
        ctx.setContent([
            {
                elem: 'head',
                text: ctx.getParam('title')
            },
            {
                elem: 'resources',
                title: '',
                links: ctx.getParam('resources'),
                listType: 'vertical'
            }
        ]);
    });

    bt.match('sidebar__head', function (ctx) {
        var text = ctx.getParam('text');

        ctx.setTag('h3');
        ctx.setContent(text);
    });

//  Группа ссылок 'Official Resources'

    bt.match('sidebar__resources', function (ctx) {
        var title = ctx.getParam('title');
        var links = ctx.getParam('links');
        var listType = ctx.getParam('listType');

        ctx.setContent([
            {
                elem: 'title',
                text: title
            },
            links.map(function (link) {
                var linkElem = {
                    elem: 'link',
                    text: link.text,
                    url: link.url
                };

                if (listType === 'vertical') {
                    return {
                        elem: 'link-list',
                        content: linkElem
                    };
                }

                return linkElem;
            })
        ]);
    });

    bt.match('sidebar__title', function (ctx) {
        var text = ctx.getParam('text');

        ctx.setTag('h4');
        ctx.setContent(text);
    });

    bt.match('sidebar__link-list', function (ctx) {
        var content = ctx.getParam('content');

        ctx.setTag('div');
        ctx.setContent(content);
    });

    bt.match('sidebar__link', function (ctx) {
        var text = ctx.getParam('text');
        var url = ctx.getParam('url');

        ctx.setTag('a');
        ctx.setContent(text);
        ctx.setAttr('href', url);
    });

};
