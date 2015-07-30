module.exports = function (bt) {

    bt.match('layout', function (ctx) {
        ctx.setContent([
            {
                elem: 'aside',
                content: ctx.getParam('aside')
            },
            {
                elem: 'content',
                content: ctx.getParam('content')
            }
        ]);
    });

    bt.match('layout__aside', function (ctx) {
        ctx.setTag('aside');
        ctx.setContent(ctx.getParam('content'));
    });

    bt.match('layout__content', function (ctx) {
        ctx.setTag('section');
        ctx.setContent(ctx.getParam('content'));
    });

};
