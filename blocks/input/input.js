modules.define(
    'input',
    ['inherit', 'block'],
    function (provide, inherit, YBlock) {
        var Input = inherit(YBlock, {
            __constructor: function () {
                this.__base.apply(this, arguments);

                console.log(this.getValue());
            },
            
            getValue: function() {
                return this.getDomNode().val();
            },


            setValue: function(value) {
                this.getDomNode().val(value);
            }
        }, {
            getBlockName: function () {
                return 'input';
            }
        });

        provide(Input);
});
