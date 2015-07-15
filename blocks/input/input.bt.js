module.exports = function (bt) {
    bt.setDefaultView('input', 'normal');

    bt.match('input*', function (ctx) {
        ctx.enableAutoInit();

        var value = ctx.getParam('value');
        var name = ctx.getParam('name');
        var placeholder = ctx.getParam('placeholder');

        ctx.setContent([
                {
                    elem: 'control',
                    inputValue: value,
                    inputName: name,
                    placeholder: placeholder
                },
                {
                    elem: 'clear'
                }
            ]);
    });

    bt.match('input*__control', function (ctx) {
        ctx.setTag('input');

        var currentValue = ctx.getParam('inputValue');
        var currentName = ctx.getParam('inputName');
        var currentPlaceholder = ctx.getParam('placeholder');

        ctx.setAttr('value', currentValue);
        ctx.setAttr('name', currentName);
        ctx.setAttr('placeholder', currentPlaceholder);
    });
};
