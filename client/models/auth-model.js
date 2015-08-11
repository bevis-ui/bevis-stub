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
                this._userData = this._getUserData();
            },

            /**
             * Проверяет, авторизован ли пользователь
             * @returns {Boolean}
             */
            isAuthorized: function () {
                return Boolean(this._userData && this._userData.login && this._userData.password);
            },

            /**
             * Сохраняет данные в куке
             * @param {Object} data Сохраняемые данные
             */
            save: function (data) {

                // Сохраняем авторизационные данные в памяти
                this._userData = data;

                // Сериализуем в строку, чтобы положить в куку
                data = JSON.stringify(data);

                // Сохраняем данные в куке...
                Cookie.set(this._cookieName, data, {
                    path: '/',
                    expires: 365
                });

                // Проверка, успешно ли сохранились данные
                if (this.isAuthorized()) {
                    this.emit('saved');
                } else {
                    this.emit('not-saved');
                }
            },

            /**
             * Возвращает авторизационные данные
             * @returns {Object}
             */
            get: function () {
                return this._userData;
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
            }
        });
    
        provide(AuthModel);
});
