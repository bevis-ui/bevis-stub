modules.require(['jquery', 'block'], function ($, Block) {
    $(function () {
        Block.initDomTree(window.document).done();
    });
});
