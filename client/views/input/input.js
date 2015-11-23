modules.define(
    'input',
    [
        'inherit',
        'block'
    ],
    function (
        provide,
        inherit,
        YBlock
    ) {
        var Input = inherit(YBlock, {
            __constructor: function (params) {
                this.__base.apply(this, arguments);

                // Получаем параметр с DOM-нодой родителя.
                this._parentNode = params.parentNode;

                // Отредери себя!
                this._render();

                this._hint = this._createElement({
                    elem: 'hint',
                    content: 'Подсказка'
                });
                this._renderHint();

                // Находим все элементы блока
                //this._clear = this._findElement('clear');
                this._control = this._findElement('control');

                // Обрабатываем клик по крестику
                //this._bindTo(this._clear, 'click', this._onClearClicked);

                // Слушаем события, которые выбросил <input>
                //this._bindTo(this._control, 'keypress', this._onKeyPressed);
                //this._bindTo(this._control, 'focus', this.focus);
                //this._bindTo(this._control, 'blur', this.blur);
            },

            /**
             * Рендерит инпут внутри указанной DOM-ноды
             * @private
             */
            _render: function () {
                this.getDomNode().appendTo(this._parentNode);
            },

            /**
             * Рендерит подсказку внутри инпута
             */
            _renderHint: function () {
                this._hint.appendTo(this.getDomNode());
            },

            /**
             * Очищает поле ввода
             */
            _onClearClicked: function () {
                if (this.isEnabled()) {
                    this.setValue('');
                    this._control.focus();
                }
            },

            /**
             * Устанавливает значение к текстовое поле
             *
             * @param {String} value Переданное значение
             * @returns {Input}
             */
            setValue: function(value) {
                this._control.val(value);
                return this;
            },

            /**
             * Получает значение из текстового поля
             *
             * @returns {String | undefined}
             */
            getValue: function() {
                return this._control.val();
            },

            /**
             * Устанавливает фокус на поле ввода.
             *
             * @returns {Input}
             */
            focus: function () {
                if (this.isEnabled()) {
                    this._setState('focused');
                }
                return this;
            },

            /**
             * Удаляет фокус с поля ввода.
             *
             * @returns {Input}
             */
            blur: function () {
                this._removeState('focused');
                return this;
            },

            /**
             * Возвращает `true`, если поле ввода активно.
             *
             * @returns {Boolean}
             */
            isEnabled: function () {
                return !this._getState('disabled');
            },

            /**
             * Деактивирует поле ввода.
             *
             * @returns {Input}
             */
            disable: function () {
                if (this.isEnabled()) {
                    this.blur();
                    this._control.attr('disabled', 'disabled');
                    this._setState('disabled');
                }
                return this;
            },

            /**
             * Активирует поле ввода.
             *
             * @returns {Input}
             */
            enable: function () {
                if (!this.isEnabled()) {
                    this._control.removeAttr('disabled');
                    this._removeState('disabled');
                }
                return this;
            },

            /**
             * В инпуте нажали кнопку "Enter"
             *
             * @param {Event} e
             */
            _onKeyPressed: function (e) {
                var text = this.getValue();

                if (e.keyCode === 13 && Input.isNotEmpty(text)) {
                    this.emit('input-submitted', {
                        value: text
                    });
                }
            }
        }, {
            getBlockName: function () {
                return 'input';
            },

            /**
             * Проверяет значение в инпуте — есть в нём какие-то символы, кроме пробельных
             *
             * @static
             * @param {String} text Текст, который нужно проверить
             * @returns {Boolean}
             */
            isNotEmpty: function (text) {
                var clearText = text.replace(/^\s+|\s+$/gi, '');
                return Boolean(clearText);
            },

            _liveInit: function () {
                this._liveBindToElement('clear', 'click', function() {
                    this._onClearClicked();
                });
                this._liveBindToElement('control', 'keypress', function(e) {
                    this._onKeyPressed(e);
                });
                this._liveBindToElement('control', 'focus', function() {
                    this.focus();
                });
                this._liveBindToElement('control', 'blur', function() {
                    this.blur();
                });
            }

        });

        provide(Input);
});
