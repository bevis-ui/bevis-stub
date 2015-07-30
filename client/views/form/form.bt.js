module.exports = function (bt) {

    bt.match('form', function (ctx) {
        ctx.enableAutoInit();

        ctx.setTag('span');

        var title = ctx.getParam('titleText');
        ctx.setContent([
            {
                elem: 'head',
                text: title
            },
            {
                elem: 'hint',                                     // <----- Создали новый элемент
                textHint: bt.lib.i18n('form', 'hint-content')     // <----- Позвали ключ для него
            }
        ]);
    });

    // Шаблон для элемента hint
    bt.match('form__hint', function (ctx) { 
        ctx.setContent(ctx.getParam('textHint'));
    });

    bt.match('form__head', function (ctx) {
        ctx.setTag('h1');

        var headText = ctx.getParam('text');
        ctx.setContent(headText);
    });

};
