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

echo "-------------------------------------------------"
echo "Создан блок blocks/$BlockName"
echo "-------------------------------------------------"
ls -la blocks/$BlockName
