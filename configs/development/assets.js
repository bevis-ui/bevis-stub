var path = require('path');
var vowFs = require('vow-fs');
var enbServerMiddleware = require('enb/lib/server/server-middleware');

module.exports = {
    /**
     * Middleware for static files: css, js, html
     */
    middleware: function () {
        return function (req, res, next) {
            if (/\.(css|js|html)/.test(req.path)) {
                this._getPageAsset(req.path).then(
                    function (asset) {
                        if (/\.css$/.test(req.path)) {
                            res.set('Content-Type', 'text/css');
                        } else if (/\.js$/.test(req.path)) {
                            res.set('Content-Type', 'application/x-javascript');
                        }
                        res.end(asset);
                    },
                    function (err) {
                        res.statusCode = 500;
                        res.end(err.toString());
                    });
            } else {
                next();
            }
        }.bind(this);
    },

    /**
     * Builds and returs static file
     *
     * @returns {Promise} promise
     */
    _getPageAsset: function (assetPath) {
        this._enbBuilder = this._enbBuilder || enbServerMiddleware.createBuilder();
        return this._enbBuilder(assetPath).then(function (filename) {
            return vowFs.read(filename, 'utf8');
        });
    },

    /**
     * @param {String} assetPath
     * @returns {Promise} promise
     */
    requirePageAsset: function (assetPath) {
        return this._getPageAsset(assetPath).then(function () {
            var modulePath = path.join('..', '..', assetPath);
            delete require.cache[path.resolve(__dirname, modulePath)];
            return require(modulePath);
        });
    }
};
