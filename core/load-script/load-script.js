/**
 * Загружает js-файлы добавляя тэг <script> в DOM.
 */
modules.define(
    'load-script',
    [
        'vow'
    ],
    function (
        provide,
        vow
    ) {

    var head = document.getElementsByTagName('head')[0];

    /**
     * Загружает js-файл по переданному пути `path`.
     *
     * @name loadScript
     * @param {String} path
     * @returns {Promise}
     *
     * @example
     * loadScript('path/to/script').then(
     *     function () {
     *         // Скрипт загрузился.
     *     },
     *     function (err) {
     *         // Произошла ошибка.
     *         // ЗАМЕЧАНИЕ: в IE 8 при возникновении ошибки данный обработчик не будет вызван.
     *     }
     * );
     */
    provide(function (path) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        // Добавляем `http:` к `//` если страница была открыта, используя `file://`-протокол.
        // Полезно для тестирования через PhantomJS, локальной отладки с внешними скриптами.
        script.src = (location.protocol === 'file:' && path.indexOf('//') === 0 ? 'http:' : '') + path;
        script.async = true;

        var defer = vow.defer();

        // IE 8
        if (script.onreadystatechange === null) {
            script.onreadystatechange = function () {
                var readyState = this.readyState;
                if (readyState === 'loaded' || readyState === 'complete') {
                    this.onreadystatechange = null;
                    // В IE 8 нет способа обработать ошибку.
                    defer.resolve();
                }
            };

        // Остальные браузеры.
        } else {
            script.onload = function () {
                this.onload = this.onerror = null;
                defer.resolve();
            };

            script.onerror = function () {
                this.onload = this.onerror = null;
                defer.reject(new Error('Failed to load ' + this.src));
            };
        }

        head.insertBefore(script, head.lastChild);

        return defer.promise();
    });
});
