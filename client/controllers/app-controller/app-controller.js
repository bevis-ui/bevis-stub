/**
 * Application start
 */
modules.require(['block', 'page-controller'], function (Block, PageController) {
    Block.initDomTree(document.body).done(function () {
        var pageController = new PageController();
        pageController.start();
    });
});
