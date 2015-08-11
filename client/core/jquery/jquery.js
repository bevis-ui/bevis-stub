/**
 * Загружает (если нет на странице) и предоставляет jQuery.
 */

/* global jQuery */
modules.define(
    'jquery',
    [
        'load-script',
        'jquery-config'
    ],
    function (
        provide,
        loadScript,
        config
    ) {

    /* global jQuery */
    if (typeof jQuery !== 'undefined') {
        provide(jQuery);
    } else {
        loadScript(config.url).done(function () {
            provide(jQuery.noConflict(true));
        });
    }
});
