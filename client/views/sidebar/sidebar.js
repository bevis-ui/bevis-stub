modules.define(
    'sidebar',
    ['inherit', 'block'],
    function (provide, inherit, YBlock) {
        var Sidebar = inherit(YBlock, {
            __constructor: function () {
                this.__base.apply(this, arguments);
            }
        }, {
            getBlockName: function () {
                return 'sidebar';
            }
        });

        provide(Sidebar);
});

