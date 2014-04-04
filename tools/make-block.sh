#!/bin/sh

echo ""
printf "Введите имя блока: "
read BlockName

if [ -d blocks/$BlockName ]; then
    echo "Операция прервана: блок '$BlockName' уже существует."
    exit
fi


mkdir -p blocks/$BlockName

echo ".$BlockName {
    /* здесь стили блока */
}" > blocks/$BlockName/$BlockName.styl

echo "module.exports = function (bt) {

    bt.match('$BlockName', function (ctx) {
        ctx.setTag('span');

        ctx.setContent('Содержимое блока');
    });

};" > blocks/$BlockName/$BlockName.bt.js

echo "modules.define(
    '$BlockName',
    ['inherit', 'block'],
    function (provide, inherit, YBlock) {
        var $BlockName = inherit(YBlock, {
            __constructor: function () {
                this.__base.apply(this, arguments);

                // здесь описываем то, что происходит сразу после создания инстанса класса
            }

            // инстанс-методы
        }, {
            getBlockName: function () {
                return '$BlockName';
            }

            // статические методы
        });

        provide($BlockName);
});
" > blocks/$BlockName/$BlockName.js

echo "-------------------------------------------------"
echo "Создан блок blocks/$BlockName"
echo "-------------------------------------------------"
ls -la blocks/$BlockName
