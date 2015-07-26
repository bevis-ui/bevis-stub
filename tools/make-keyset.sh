#!/bin/sh

echo ""
printf "Введите имя keyset: "
read KeySet

if [ -d blocks/i18n/_keyset/i18n_keyset_$KeySet.i18n ]; then
    echo "Операция прервана: keyset '$KeySet' уже существует."
    exit
fi


mkdir -p blocks/i18n/_keyset/i18n_keyset_$KeySet.i18n

echo "module.exports = {
    \"$KeySet\": {
        \"my-key\": \"моё значение\"
    }
}; " > blocks/i18n/_keyset/i18n_keyset_$KeySet.i18n/ru.js

echo "module.exports = {
    \"$KeySet\": {
        \"my-key\": \"my value\"
    }
}; " > blocks/i18n/_keyset/i18n_keyset_$KeySet.i18n/en.js

echo "----------------------------------------------------------"
echo "Создан keyset blocks/i18n/_keyset/i18n_keyset_$KeySet.i18n"
echo "----------------------------------------------------------"
ls -la blocks/i18n/_keyset/i18n_keyset_$KeySet.i18n
