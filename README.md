## Запуск
```shell
git clone git@github.com:bevis-ui/bevis-stub.git your-project
cd your-project
make
```
Команда `make` выкачает все необходимые инструменты, соберет единственную страницу и запустит локальный сервер.

Откройте в браузере `http://localhost:8080/`

## Запуск в Windows
Убедитесь, что в пути к проекту нет символов unicode, иначе это может привести к  [ошибкам](https://github.com/bevis-ui/bevis-stub/issues/9). 

```shell
git clone git@github.com:bevis-ui/bevis-stub.git your-project
cd your-project
npm install
node_modules\.bin\enb make
node_modules\.bin\supervisor -w server,configs -- server/boot.js
```
При выполнении последней комады может возникнуть следующая ошибка:
`Error: Cannot find module '../configs/current/env'`
Она связана с отсутвием символической ссылки на текущую конфигурацию проекта (configs\current). 
Чтобы ее создать, необходимо выполнить следующие команды:
```shell
rm configs\current
mklink /J configs\current configs\development
git update-index --assume-unchanged configs/current
```

## Как подключить свой репозиторий
В директории `your-project` у вас находится клон `bevis-ui/bevis-stub`, его `origin` "смотрит" в наш репозиторий.
 Вы хотите писать свой проект и пушить его в свой репозиторий? Три команды:  
```shell
git remote rename origin upstream
git remote add origin git@github.com:<ваш_аккаунт_на_гитхабе>/<имя_репозитория>.git
git push -u origin master
```
Теперь `origin` "смотрит" в ваш репозиторий. А `upstream` смотрит в оригинальный `github.com:bevis-ui/bevis-stub` 

Чтобы получить обновления из `github.com:bevis-ui/bevis-stub`, делаем `git pull` из `upstream`:
```
git pull upstream master
```
Чтобы получать обновления из _вашего_ и пушить в _ваш_, работаем с `origin`:
```
git pull origin master
git push origin master
```

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
```

## Как сгенерить статические html-файлы?
```shell
make static
```
После на файловой системе в папке `build/*/` появятся статические `*.html` файлы 

Успехов! :)
```
