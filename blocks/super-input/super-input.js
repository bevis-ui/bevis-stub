modules.define(
    'super-input',
    [
        'inherit', 
        'input'
    ],
    function (
        provide, 
        inherit, 
        Input
    ) {
        var SuperInput = inherit(Input, {
            __constructor: function (params) {
                this.__base.apply(this, arguments);
            },

            // Переопределили метод класса Input
            focus: function () {
                console.log('Переопределил метод focus!');

                // Вызвали базовый метод
                this.__base();
            }
        });

        provide(SuperInput);
});
