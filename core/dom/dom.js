modules.define(
    'dom',
    ['jquery', 'block'],
    function (provide, $, Block) {

    /**
     * @name dom
     */
    provide({
        /**
         * Отсоединяет фрагмент DOM-дерева от документа.
         * Сохраняет слушатели событий и данные (jQuery data).
         *
         * @name dom.detach
         * @param {jQuery|HTMLElement|Block} domNode
         */
        detach: function (domNode) {
            domNode = this._getDomElement(domNode);
            var l = domNode.length;
            for (var i = 0; i < l; i++) {
                var node = domNode[i];
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            }
        },

        /**
         * Заменяет один DOM-фрагмент другим.
         *
         * @name dom.replace
         * @param {jQuery|HTMLElement|Block} replaceWhat
         * @param {jQuery|HTMLElement|Block} replaceWith
         */
        replace: function (replaceWhat, replaceWith) {
            replaceWhat = this._getDomElement(replaceWhat);
            replaceWith = this._getDomElement(replaceWith);
            replaceWith.insertBefore(replaceWhat);
            this.detach(replaceWhat);
        },

        /**
         * Вставляет `domNode` перед `sourceDomNode`.
         *
         * @name dom.insertBefore
         * @param {jQuery|HTMLElement|Block} domNode
         * @param {jQuery|HTMLElement|Block} sourceDomNode
         */
        insertBefore: function (domNode, sourceDomNode) {
            domNode = this._getDomElement(domNode);
            sourceDomNode = this._getDomElement(sourceDomNode);
            sourceDomNode.insertBefore(domNode);
        },

        /**
         * Вставляет `domNode` после `sourceDomNode`.
         *
         * @name dom.insertAfter
         * @param {jQuery|HTMLElement|Block} domNode
         * @param {jQuery|HTMLElement|Block} sourceDomNode
         */
        insertAfter: function (domNode, sourceDomNode) {
            domNode = this._getDomElement(domNode);
            sourceDomNode = this._getDomElement(sourceDomNode);
            sourceDomNode.insertAfter(domNode);
        },

        /**
         * Добавляет `domNode` в конец `parentDomNode`.
         *
         * @name dom.append
         * @param {jQuery|HTMLElement} parentDomNode
         * @param {jQuery|HTMLElement|Block} domNode
         */
        append: function (parentDomNode, domNode) {
            parentDomNode = $(parentDomNode);
            parentDomNode.append(this._getDomElement(domNode));
        },

        /**
         * Добавляет `domNode` в начало `parentDomNode`.
         *
         * @name dom.prepend
         * @param {jQuery|HTMLElement} parentDomNode
         * @param {jQuery|HTMLElement|Block} domNode
         */
        prepend: function (parentDomNode, domNode) {
            parentDomNode = $(parentDomNode);
            parentDomNode.prepend(this._getDomElement(domNode));
        },

        /**
         * Заменяет содержимое `parentDomNode` фрагментом `domNode`.
         *
         * @name dom.replaceContents
         * @param {jQuery|HTMLElement} parentDomNode
         * @param {jQuery|HTMLElement|Block} domNode
         */
        replaceContents: function (parentDomNode, domNode) {
            parentDomNode = $(parentDomNode);
            domNode = this._getDomElement(domNode);
            var contents = parentDomNode.contents();
            if (contents.length) {
                this.replace(contents, domNode);
            } else {
                parentDomNode.append(domNode);
            }
        },

        /**
         * Возвращает jQuery-элемент для переданного `HTML`/`jQuery`/`Block`/`String`-представления элемента.
         *
         * @param {jQuery|HTMLElement|Block|String} domNode
         * @returns {jQuery}
         */
        _getDomElement: function (domNode) {
            if (domNode instanceof Block) {
                domNode = domNode.getDomElement();
            }
            if (typeof domNode === 'string') {
                var div = $('<div></div>');
                div.html(domNode);
                return div.contents();
            } else {
                return $(domNode);
            }
        },
        html: {
            /**
             * Преобразует сущности HTML-синтаксиса в безопасные эквиваленты.
             *
             * @name dom.html.escape
             * @param {String} str
             * @returns {String}
             */
            escape: function (str) {
                return str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }
        },
        focus: {
            /**
             * Возвращает `true` если на элемент возможно поставить фокус.
             *
             * @name dom.focus.isFocusable
             * @param {jQuery|HTMLElement} domNode
             */
            isFocusable: function (domNode) {
                domNode = $(domNode)[0];
                switch (domNode.nodeName.toLowerCase()) {
                    case 'iframe':
                        return true;
                    case 'input':
                    case 'button':
                    case 'textarea':
                    case 'select':
                        return !domNode.hasAttribute('disabled');
                    case 'a':
                        return domNode.hasAttribute('href');
                    default:
                        return domNode.hasAttribute('tabindex');
                }
            },

            /**
             * Возвращает `true` если элемент сфокусирован.
             *
             * @name dom.focus.hasFocus
             * @param {jQuery|HTMLElement} domNode
             */
            hasFocus: function (domNode) {
                domNode = $(domNode)[0];
                var activeNode = document.activeElement;
                if (activeNode) {
                    var currentNode = activeNode;
                    while (currentNode) {
                        if (currentNode === domNode) {
                            return true;
                        }
                        currentNode = currentNode.parentNode;
                    }
                }
                return false;
            }
        },
        selection: {
            /**
             * Возвращает позицию курсора в поле ввода.
             *
             * @param {jQuery|HTMLElement} input
             * @returns {number}
             */
            getInputCaretPosition: function (input) {
                input = $(input)[0];
                var pos = 0;
                if (document.selection) { // ie
                    input.focus();
                    var selection = document.selection.createRange();
                    selection.moveStart('character', -input.value.length);
                    pos = selection.text.length;
                } else if (input.selectionStart || input.selectionStart === 0) { // firefox
                    pos = input.selectionStart;
                }
                return pos;
            }
        }
    });

});
