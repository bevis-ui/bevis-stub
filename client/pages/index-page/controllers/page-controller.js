modules.define(
    'page-controller',
    [
        'inherit',
        'jquery',
        'sidebar',
        'form',
        'y-i18n',
        'auth-model' // <-- Позвали модуль с моделью авторизации
    ],
    function (
        provide,
        inherit,
        $,
        SidebarView,
        FormView,
        i18n,
        AuthModel    // <-- Получили модель как переменную AuthModel
    ) {

    var PageController = inherit({
        __constructor: function () {
            console.log('index: PageController constructor');

            // Создали экземпляр Модели Авторизации
            this._authModel = new AuthModel();
            this._authModel.on('saved', this.start, this);
        },

        /**
         * Отображает контент или форму авторизации, елси пользователь незалогинен
         */
        start: function () {
            $('body').empty();

            // Получаем состояние авторизации - да или нет.
            var isAuthorized = this._authModel.isAuthorized();

            if (isAuthorized) {

                // Получаем авторизационные данные
                var authData = this._authModel.get();

                // Отображаем контент с участием авторизационных данных
                var sidebarView = new SidebarView({
                    title: 'Привет, ' + authData.login + '!',  // <------- Здесь показываем логин пользователя
                    resources: [
                        {
                            text: 'Репозиторий',
                            url: 'https://github.com/bevis-ui/'
                        },
                        {
                            text: 'Учебник для новичков',
                            url: 'https://github.com/bevis-ui/docs/blob/master/manual-for-beginner.md'
                        },
                        {
                            text: 'Учебник для старичков',
                            url: 'https://github.com/bevis-ui/docs/blob/master/manual-for-master.md'
                        }
                    ]
                });

                sidebarView.getDomNode().appendTo($('body'));

            } else {

                var formAuthView = new FormView({
                    titleText: i18n('form', 'title-text')
                });

                formAuthView.getDomNode().appendTo($('body'));
                formAuthView.on('form-submitted', this._onFormAuthSubmitted, this);
            }
        },

        /**
         * Обработчик сабмита на форме авторизации
         * @param {YEventEmitter} e
         */
        _onFormAuthSubmitted: function (e) {
            this._authModel.save(e.data); // <---- Сохраняем данные, пришедшие из формы
        }
    });

    provide(PageController);
});
