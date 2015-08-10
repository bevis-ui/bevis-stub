modules.define(
    'auth-model',
    [
        'inherit', 
        'event-emitter'
    ],
    function (
        provide, 
        inherit, 
        YEventEmitter
    ) {
        var AuthModel = inherit(YEventEmitter, {
            __constructor: function () {
                this.__base.apply(this, arguments);

                /**
                 * Текущее состояние авторизации
                 * @type {Boolean}
                 */
                this._isAuthorized = false;
            },

            /**
             * Проверяет, авторизован ли пользователь
             * @returns {Boolean}
             */
            isAuthorized: function () {
                return this._isAuthorized;
            },

            /**
             * Сохраняет данные в куке
             * @param {Object} data Сохраняемые данные
             */
            saveUserData: function (data) {
                console.log("data = ", data);

                // Сохраняем данные в куке...

                // Сообщаем, что данные сохранены успешно
                this._onSavingSuccess();
            },

            /**
             * Эмитирует событие о том, что авторизационные данные сохранены успешно
             */
            _onSavingSuccess: function () {
                // Сохраняем информацию в хранилище
                this._isAuthorized = true;

                // Сообщаем об успехе
                this.emit('user-data-saved');
            }
        });
    
        provide(AuthModel);
});

