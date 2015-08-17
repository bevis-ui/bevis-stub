var inherit = require('inherit');
var path = require('path');
var vow = require('vow');
var vowFs = require('vow-fs');
var Page = require('./page');

var StaticPage = inherit(Page, {
    /**
     * Build static page
     *
     * @returns {Promise} promise
     */
    handle: function () {
        return vow.all([
                this._getPages(),
                this._getTemplate(),
                this._getI18n()
            ])
            .spread(function (pages, bt, buildI18n) {
                var i18n = buildI18n();
                pages.setI18n(i18n);
                bt.lib.i18n = i18n;

                return pages
                    .exec(this._pageName, {
                        query: this._query,
                        options: this._getPageOptions(),
                        lang: this._lang
                    })

                    .then(function (btJson) {
                        var html = this._applyTemplate(btJson, bt);

                        return this._makeStaticPage(this._id, html);
                    }.bind(this));

            }.bind(this));
    },

    /**
     * Returns path for css and js files
     *
     * @returns {Object}
     */
    _getPageOptions: function () {
        return {
            assetsPath: '_' + path.basename(this._id)
        };
    },

    /**
     * Создаёт статическую страницу по переданному пути.
     *
     * @param {String} pageName
     * @param {String} html
     * @returns {Promise}
     */
    _makeStaticPage: function(pageName, html) {
        var fileName = path.basename(pageName);
        var filePath = pageName + '/' + fileName + '.html';

        return vowFs
            .write(filePath, html)
            .then(function () {
                return filePath;
            });
    }

}, {
    /**
     * @param {String} pageName
     * @param {String} lang
     */
    make: function (pageName, lang) {
        var req = {
            query: {
                lang: lang
            }
        };

        return new StaticPage('build/' + pageName, pageName + '-page', req, {})
                .handle()
                .then(function (filePath) {
                    console.log('Vow! Generated ' + filePath);
                });
    }
});

module.exports = StaticPage;
