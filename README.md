## Запуск
```
git clone git@github.com:bevis-ui/bevis-stub.git your-project
cd your-project
make
```

Команда `make` выкачает все необходимые инструменты, соберет единственную страницу и запустит локальный сервер.

Откройте в браузере `http://localhost:8080/`


## Как сделать ещё одну страницу?
Запустить команду и ответить на вопрос:
```shell
make page
# Введите имя страницы: <ИМЯ СТРАНИЦЫ>
```
После на файловой системе станет доступна страница `/pages/<ИМЯ СТРАНИЦЫ>/<ИМЯ СТРАНИЦЫ>-page.page.js`.

А в браузере она же по адресу `http://localhost:8080/<ИМЯ СТРАНИЦЫ>`


## Как сделать ещё один блок?
Запустить команду и ответить на вопрос:
```shell
make block
# Введите имя блока: <ИМЯ БЛОКА>
```
После на файловой системе станет доступна директория с файлами блока `/blocks/<ИМЯ БЛОКА>`.

Успехов! :)


## Запуск в Windows
```
git clone git@github.com:bevis-ui/bevis-stub.git your-project
cd your-project
npm install
node_modules\.bin\enb make
node_modules\.bin\supervisor -w server,configs -- server/boot.js
```

В проекте используется символическая ссылка на каталог (configs\current), в некоторых случаях это может вызвать проблему. 
[hotfix](https://github.com/bevis-ui/bevis-stub/pull/4)
