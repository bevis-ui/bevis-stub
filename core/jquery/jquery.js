/**
 * Загружает (если нет на странице) и предоставляет jQuery.
 */

/* global jQuery */
modules.define(
    'jquery',
    ['load-script', 'jquery__config'],
    function (provide, loadScript, config) {

    if (typeof jQuery !== 'undefined') {
        provide(jQuery);
    } else {
        loadScript(config.url, function () {
            provide(jQuery);
        });
    }
});
