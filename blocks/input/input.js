modules.define(
    'input',
    ['inherit', 'block'],
    function (provide, inherit, YBlock) {
        var Input = inherit(YBlock, {
            __constructor: function () {
                this.__base.apply(this, arguments);

                console.log(this.getValue());

                // здесь описываем то, что происходит сразу после создания инстанса класса
            },

            getValue: function() {
                return this.getDomNode().val();
            },

            setValue: function() {
                this.getDomNode().val(value);
            }

            // инстанс-методы
        }, {
            getBlockName: function () {
                return 'input';
            }

            // статические методы
        });

        provide(Input);
});

