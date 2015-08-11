modules.define(
    'auth-model',
    [
        'inherit', 
        'event-emitter',
        'cookie'
    ],
    function (
        provide, 
        inherit, 
        YEventEmitter,
        Cookie
    ) {
        var AuthModel = inherit(YEventEmitter, {
            __constructor: function () {
                this.__base.apply(this, arguments);

                this._cookieName = 'authorization';
            },

            /**
             * Проверяет, авторизован ли пользователь
             * @returns {Boolean}
             */
            isAuthorized: function () {
                var userData = this._getUserData();

                return Boolean(userData && userData.login && userData.password);
            },

            /**
             * Сохраняет авторизационные данные
             * @param {Object} data Сохраняемые данные
             */
            save: function (data) {
                // Передаём данные в бекенд или в куку
                this._setUserData(data);

                // Сообщаем контроллеру об успехе
                this.emit('saved');
            },

            /**
             * Возвращает авторизационные данные
             * @returns {Object}
             */
            get: function () {
                return this._getUserData();
            },

            /**
             * Возвращает авторизационные данные пользователя
             * Берёт их из куки 'authorization'
             *
             * @returns {Object | null}
             */
            _getUserData: function () {
                var authCookie = Cookie.get(this._cookieName);

                return authCookie? JSON.parse(authCookie) : null;
            },

            /**
             * Сохраняет авторизационные данные в куке
             * @param {Object} data Сохраняемые данные
             */
            _setUserData: function (data) {
                // Сериализуем в строку, чтобы положить в куку
                data = JSON.stringify(data);

                // Сохраняем данные в куке...
                Cookie.set(this._cookieName, data, {
                    path: '/',
                    expires: 365
                });
            }
        });
    
        provide(AuthModel);
});
