/**
 * Функции для получения, установки и удаления cookies. На основе плагина $.cookie от Klaus Hartl (stilbuero.de).
 */
modules.define('cookie', function (provide) {

    /**
     * Регулярное выражение для разбиения строки cookies.
     */
    var SPLIT_RE = /\s*;\s*/;

    var doc = document;

    provide({
        /**
         * Возвращает значение куки с переданным именем.
         *
         * @param {String} name Имя куки.
         * @returns {String|undefined} Значение куки.
         */
        get: function (name) {
            if (doc.cookie && doc.cookie !== '') {
                name = encodeURIComponent(name);
                var nameEq = name + '=';
                var cookies = doc.cookie.split(SPLIT_RE);
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i];
                    // Проверяем, что строка cookie начинается с нужного имени.
                    if (cookie.lastIndexOf(nameEq, 0) === 0) {
                        return decodeURIComponent(cookie.substring(nameEq.length));
                    }
                    if (cookie === name) {
                        return '';
                    }
                }
            }
        },

        /**
         * Устанавливает куку.
         *
         * @param {String} name Имя куки.
         * @param {String} value Значение куки.
         * @param {Object} [options]
         * @param {Number|Date} [options.expires] Время жизни куки. Число интерпретируется как число дней со времени
         *      создания куки. Если не указано, устанавливается сессионная кука.
         * @param {String} [options.path] Путь куки. Если не указан используется путь страницы, где была создана кука.
         * @param {String} [options.domain] Домен куки. Если не указан используется домен страницы, где была создана
         *      кука.
         * @param {Boolean} [options.secure=false] Должна ли cookie передаваться по защищенному каналу.
         */
        set: function (name, value, options) {
            var cookieStr = encodeURIComponent(name) + '=' + encodeURIComponent(value);

            if (options) {
                var expires = options.expires;
                if (expires) {
                    var date;
                    if (typeof expires === 'number') {
                        date = new Date(Date.now() + expires * 1000 * 60 * 60 * 24);
                    } else if (expires instanceof Date) {
                        date = expires;
                    }
                    cookieStr += ';expires=' + date.toUTCString();
                }

                if (options.domain) {
                    cookieStr += ';domain=' + options.domain;
                }

                if (options.path) {
                    cookieStr += ';path=' + options.path;
                }

                if (options.secure) {
                    cookieStr += ';secure';
                }
            }

            doc.cookie = cookieStr;
        },

        /**
         * Удаляет куку.
         *
         * @param {String} name Имя куки.
         * @param {Object} [options]
         * @param {String} [options.path] Путь куки.
         * @param {String} [options.domain] Домен куки.
         */
        remove: function (name, options) {
            options = options || {};
            options.expires = new Date(0);
            this.set(name, '', options);
        }
    });
});
