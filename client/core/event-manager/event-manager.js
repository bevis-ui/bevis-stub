modules.define(
    'event-manager',
    [
        'inherit',
        'event-emitter',
        'jquery'
    ],
    function (
        provide,
        inherit,
        EventEmitter,
        $
    ) {

    /**
     * Адаптер для EventEmitter, jQuery. Позволяет привязывать обработчики к разным эмиттерам событий
     * и отвязывать их, используя вызов одной функции. Менеджер всегда привязан к какому-либо объекту, который
     * является контекстом для всех обработчиков.
     *
     * Полезен, когда нужно отвязать все обработчики сразу. Например, при уничтожении объекта.
     *
     * @example
     * function UserView(model, el) {
     *     this._eventManager = new EventManager(this);
     *
     *     // Привязываем обработчик к EventEmitter
     *     this._eventManager.bindTo(model, 'change-name', this._changeName);
     *
     *     // Привязываем обработчик к jQuery объекту
     *     var hideEl = el.find('.hide');
     *     this._eventManager.bindTo(hideEl, 'click', this._hide);
     * }
     *
     * UserView.prototype.destruct = function () {
     *     // Удаляем все обработчики
     *     this._eventManager.unbindAll();
     * };
     *
     * UserView.prototype._changeName = function () {};
     *
     * UserView.prototype._hide = function () {};
     */
    var EventManager = inherit({
        /**
         * Создает менджер событий для переданного объекта.
         *
         * @param {Object} owner Контекст для всех обработчиков событий.
         */
        __constructor: function (owner) {
            this._owner = owner;
            this._listeners = [];
        },

        /**
         * Привязывает обработчик к переданному эмиттеру событий.
         *
         * @param {EventEmitter|jQuery} emitter
         * @param {String} event
         * @param {Function} callback
         * @returns {EventManager}
         */
        bindTo: function (emitter, event, callback) {
            if (emitter instanceof EventEmitter) {
                this._listeners.push({
                    type: 'islets',
                    emitter: emitter.on(event, callback, this._owner),
                    event: event,
                    callback: callback
                });
            } else if (emitter instanceof $) {
                var proxy = callback.bind(this._owner);
                this._listeners.push({
                    type: 'jquery',
                    emitter: emitter.on(event, proxy),
                    event: event,
                    callback: callback,
                    proxy: proxy
                });
            } else {
                throw new Error('Unsupported emitter type');
            }
            return this;
        },

        /**
         * Отвязывает обработчик от переданного эмиттера событий.
         *
         * @param {EventEmitter|jQuery} emitter
         * @param {String} event
         * @param {Function} callback
         * @returns {EventManager}
         */
        unbindFrom: function (emitter, event, callback) {
            for (var i = 0; i < this._listeners.length; i++) {
                var listener = this._listeners[i];
                if (listener.emitter === emitter &&
                    listener.event === event &&
                    listener.callback === callback
                ) {
                    this._unbind(listener);
                    this._listeners.splice(i, 1);
                    break;
                }
            }
            return this;
        },

        /**
         * Отвязывает все обработчики от всех эмиттеров событий.
         *
         * @returns {EventManager}
         */
        unbindAll: function () {
            while (this._listeners.length) {
                var listener = this._listeners.pop();
                this._unbind(listener);
            }
            return this;
        },

        /**
         * Отвязывает обработчик события.
         *
         * @private
         * @param {Object} listener
         */
        _unbind: function (listener) {
            switch (listener.type) {
                case 'islets':
                    listener.emitter.off(listener.event, listener.callback, this._owner);
                    break;
                case 'jquery':
                    listener.emitter.off(listener.event, listener.proxy);
            }
        }
    });

    provide(EventManager);
});
