#!/bin/sh

echo ""
printf "Введите имя страницы: "
read PageName


if [ -d build/$PageName  ]; then
    echo "Операция прервана: Директория с таким именем существует по адресу build/$PageName"
    exit
fi

if [ -d pages/$PageName-page  ]; then
    echo "Операция прервана: Директория с таким именем существует по адресу pages/$PageName-page"
    exit
fi

mkdir -p build/$PageName
echo "module.exports.deps = ['${PageName}-page'];" > build/$PageName/$PageName.bemdecl.js

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

echo "-------------------------------------------------"
echo "Создана страница pages/$PageName-page"
echo "-------------------------------------------------"
ls -la pages/$PageName-page
