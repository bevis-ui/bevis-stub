var Vow = require('vow');

function Pages () {
    this._pages = {};
    /**
     * Basic i18n implementation. Returns key for each call.
     *
     * @public
     * @param {String} keyset
     * @param {String} key
     * @returns {String}
     */
    this.i18n = function (keyset, key) {
        return key;
    };
}

Pages.prototype = {

    /**
     * Declares server page.
     *
     * @param name
     * @param method
     * @returns {Pages}
     */
    declare: function (name, method) {
        this._pages[name] = method;
        return this;
    },

    /**
     * Executes server page.
     *
     * @param {String} name
     * @param {Object} params
     * @returns {Promise}
     */
    exec: function (name, params) {
        var page = this._pages[name];
        return Vow.fulfill().then(function () {
            if (page) {
                return page(params);
            } else {
                return Vow.reject(new Error('Page "' + name + '" was\'t found'));
            }
        });
    },

    /**
     * Sets i18n library.
     *
     * @param {i18n} i18n
     */
    setI18n: function (i18n) {
        this.i18n = i18n;
    }
};

module.exports = Pages;
