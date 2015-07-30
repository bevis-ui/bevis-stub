modules.define(
    'form',
    [
        'inherit',
        'block',
        'input',
        'super-input',
        'y-i18n'
    ],
    function (
        provide,
        inherit,
        YBlock,
        Input,
        SuperInput,
        i18n
    ) {
        var form = inherit(YBlock, {
            __constructor: function () {
                this.__base.apply(this, arguments);

                var formDomNode = this.getDomNode();

                // Создаём инпут
                this._greetingInput = new Input({
                    value: 'Привет, Бивис',
                    name: 'loginField',
                    placeholder: 'Инпут на сайте',

                    parentNode: formDomNode
                });
                this._greetingInput.on('input-submitted', this._onInputSubmitted, this);

                // Создаём инпут для пароля
                this._passwordInput = new SuperInput({
                    name: 'passwordField',
                    type: 'password',
                    placeholder: i18n('any-other', 'my-key'),

                    parentNode: formDomNode
                });
                this._passwordInput.on('input-submitted', this._onInputSubmitted, this);
            },

            /**
             * Реагирует на нажатие клавиши Enter в `Input`
             * @param {YEventEmitter} e
             */
            _onInputSubmitted: function (e) {
                console.log('Форма поймала событие на Input = ', e);
            }
        }, {
            getBlockName: function () {
                return 'form';
            }
        });

        provide(form);
});
