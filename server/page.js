var inherit = require('inherit');
var path = require('path');
var config = require('./config');
var assets = config.get('assets');
var vow = require('vow');
var logger = require('./logger');

var Page = inherit({
    /**
     * Page
     *
     * @param {String} id Relative path to page (pages/index, for example)
     * @param {String} pageName Page name.
     * @param {Request} req Node request Object
     * @param {Response} res Node response Object
     */
    __constructor: function (id, pageName, req, res) {
        this._id = id;
        this._pageName = pageName;
        this._req = req;
        this._res = res;
        this._lang = req.query.lang || 'ru';
        this._query = req.query;
    },

    /**
     * Build page
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

                return pages.exec(this._pageName, {
                    query: this._query,
                    options: this._getPageOptions(),
                    lang: this._lang
                }).then(function (btJson) {
                    return this._applyTemplate(btJson, bt);
                }.bind(this));
            }.bind(this));
    },

    /**
     * Returns page handlers
     *
     * @returns {Promise} promise
     */
    _getPages: function () {
        return assets.requirePageAsset(this._buildAssetPath('page'));
    },

    /**
     * Returns bt templates
     *
     * @returns {Promise} promise
     */
    _getTemplate: function () {
        return assets.requirePageAsset(this._buildAssetPath('bt'));
    },

    /**
     * Returns i18n
     *
     * @returns {Promise} promise
     */
    _getI18n: function () {
        return assets.requirePageAsset(this._buildAssetPath('lang.' + this._lang));
    },

    /**
     * Returns path to a technology
     *
     * @param {String} tech
     * @returns {String} path
     */
    _buildAssetPath: function (tech) {
        return ['/', this._id, '/', path.basename(this._id), '.', tech, '.js'].join('');
    },

    /**
     * Returns path for css and js files
     *
     * @returns {Object}
     */
    _getPageOptions: function () {
        return {
            assetsPath: [
                'host' in assets ? assets.host : '',
                '/', this._id, '/_', path.basename(this._id)
            ].join('')
        };
    },

    /**
     * Returns path to a technology
     *
     * @param {Object} btJson
     * @param {BT} template
     * @returns {Promise} promise
     */
    _applyTemplate: function (btJson, template) {
        var startTime = Date.now();
        logger.verbose('bt running');
        var res = template.apply(btJson);
        logger.verbose('bt completed at %d ms', Date.now() - startTime);
        return res;
    }
}, {
    /**
     * @param {String} pageName
     */
    createHandler: function (pageName) {
        return function (req, res, next) {
            new Page('build/' + pageName, pageName + '-page', req, res)
                .handle()
                .then(
                    function (html) {
                        res.end(html);
                    },
                    next
                );
        };
    }
});

module.exports = Page;
