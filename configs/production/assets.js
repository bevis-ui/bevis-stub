var path = require('path');

module.exports = {
    /**
     * Disable middleware for static files
     */
    middleware: function () {
        return function (req, res, next) {
            return next();
        };
    },

    /**
     * @param {String} assetPath
     * @returns {Module} module
     */
    requirePageAsset: function (assetPath) {
        var modulePath = path.join('..', '..', assetPath);
        return require(modulePath);
    }
};
