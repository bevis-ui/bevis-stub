modules.define(
    'page-controller',
    [
        'inherit'
    ],
    function (
        provide,
        inherit
    ) {

    var PageController = inherit({
        __constructor: function () {
            console.log('test: PageController constructor');
        },

        start: function () {
            console.log('test: PageController started');
        }
    });

    provide(PageController);
});
