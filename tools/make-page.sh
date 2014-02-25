#!/bin/sh

printf "Enter Page Name: "
read PageName
mkdir -p build
mkdir -p build/$PageName
echo "module.exports.deps = ['${PageName}-page'];" > build/$PageName/$PageName.bemdecl.js

mkdir -p pages
mkdir -p pages/$PageName-page
echo "- page" > pages/$PageName-page/$PageName-page.deps.yaml
echo "module.exports = function (pages) {
    pages.declare('${PageName}-page', function (params) {
        var options = params.options;
        return {
            block: 'page',
            title: '${PageName} page',
            styles: [
                {url: options.assetsPath + '.css'}
            ],
            scripts: [
                {url: options.assetsPath + '.js'}
            ],
            body: [
                // здесь ваши блоки
            ]
        };
    });
};" > pages/$PageName-page/$PageName-page.page.js
