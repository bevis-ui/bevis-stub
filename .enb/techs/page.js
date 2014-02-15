var path = require('path');
var vowFs = require('vow-fs');

module.exports = require('enb/lib/build-flow').create()
    .name('page-js')
    .target('target', '?.page.js')
    .defineOption('pagesFile', '')
    .useFileList(['page.js'])
    .needRebuild(function (cache) {
        this._pagesFile = this._pagesFile || '.enb/lib/pages.js';
        this._pagesFile = this.node._root + '/' + this._pagesFile;
        return cache.needRebuildFile('page-file', this._pagesFile);
    })
    .saveCache(function (cache) {
        cache.cacheFileInfo('page-file', this._pagesFile);
    })
    .builder(function (bhFiles) {
        var node = this.node;
        function buildRequire(absPath, pre, post) {
            var relPath = node.relativePath(absPath);
            return [
                'dropRequireCache(require, require.resolve("' + relPath + '"));',
                (pre || '') + 'require("' + relPath + '")' + (post || '') + ';'
            ].join('\n');
        }
        var dropRequireCacheFunc = [
            'function dropRequireCache(requireFunc, filename) {',
            '    var module = requireFunc.cache[filename];',
            '    if (module) {',
            '        if (module.parent) {',
            '            if (module.parent.children) {',
            '                var moduleIndex = module.parent.children.indexOf(module);',
            '                if (moduleIndex !== -1) {',
            '                    module.parent.children.splice(moduleIndex, 1);',
            '                }',
            '            }',
            '            delete module.parent;',
            '        }',
            '        delete module.children;',
            '        delete requireFunc.cache[filename];',
            '    }',
            '};'
        ].join('\n');
        return [
            dropRequireCacheFunc,
            buildRequire(this._pagesFile, 'var Pages = '),
            'var pages = new Pages();',
            bhFiles.map(function (file) {
                return buildRequire(file.fullname, '', '(pages)');
            }).join('\n'),
            'module.exports = pages;'
        ].join('\n');
    })
    .createTech();

