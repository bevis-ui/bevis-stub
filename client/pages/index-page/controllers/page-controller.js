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
            console.log('index: PageController constructor');
        },

        start: function () {
            console.log('index: PageController started');
        }
    });

    provide(PageController);
});
