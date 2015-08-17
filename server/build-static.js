var path = require('path');
var vow = require('vow');
var vowFs = require('vow-fs');
var StaticPage = require('./static-page');

var LANG = 'ru';

vowFs
    .listDir('build')
    .then(function (list) {
        var pagesPromises = list.map(function (pageName) {
            return StaticPage.make(pageName, LANG);
        });

        return vow.all([
            pagesPromises
        ]);
    })
    .done();

