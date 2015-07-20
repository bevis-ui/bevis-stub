module.exports = function (bt) {

    bt.match('form', function (ctx) {
        ctx.enableAutoInit();

        ctx.setTag('span');

        ctx.setContent('Содержимое блока');
    });

};
