modules.define(
    'block',
    [
        'inherit',
        'event-emitter',
        'event-manager',
        'block-event',
        'jquery',
        'vow',
        'bt',
        'extend'
    ],
    function (
        provide,
        inherit,
        EventEmitter,
        EventManager,
        BlockEvent,
        $,
        vow,
        bt,
        extend
    ) {

    var Block = inherit(EventEmitter, /** @lends Block.prototype */ {
        /**
         * Конструктор базового блока.
         * Его следует вызывать с помощью `this.__base` в наследующих классах.
         *
         * @constructor
         * @param {jQuery} [domNode] Элемент, на котором следует инициализировать блок.
         * @param {Object} [options] Опции блока. Содержит все декларированные опции BH-шаблона блока.
         *
         * @example
         * modules.define('control', ['block'], function (provide, Block) {
         *     var Control = inherit(Block, {
         *         __constructor: function () {
         *             this.__base.apply(this, arguments);
         *             // Дополнительные действия по инициализации
         *         }
         *     }, {
         *         getBlockName: function () {
         *             return 'control';
         *         }
         *     }));
         *
         *     provide(Control);
         * });
         */
        __constructor: function (domNode, options) {
            if (!domNode) {
                options = options || {};
                domNode = this._createDomElement(options);
            }

            // Если параметры не переданы, извлекаем их из DOM-ноды.
            if (!options) {
                options = this.__self._getDomNodeOptions(domNode).options || {};
            } else if (!options.__complete) {
                options = extend(options, this.__self._getDomNodeOptions(domNode).options || {});
            }

            // Store block instance link in jQuery data storage for this node.
            var nodeStorage = this.__self._getDomNodeDataStorage(domNode);
            nodeStorage.blocks[this.__self.getBlockName()] = this;

            this._options = options;
            this._node = domNode;
            this._eventManager = new EventManager(this);
            this._stateCache = null;
            this.__self._liveInitIfRequired();
            this._cachedViewName = null;
        },

        /**
         * Уничтожает блок. При уничтожении блок автоматически отвязывает все обработчики событий,
         * которые были привязаны к инстанции блока или привязаны внутри блока, используя метод `_bindTo()`.
         *
         * Этот метод следует перекрывать, если необходимы дополнительные действия при уничтожении блока.
         * При этом необходимо вызывать базовую реализацию деструктора с помощью `this.__base()`.
         *
         * @example
         * destruct: function () {
         *     this._cache.drop();
         *     this.__base();
         * }
         */
        destruct: function () {
            if (this._destructed) {
                return;
            }
            this.offAll();

            this._eventManager.unbindAll();
            this._eventManager = null;

            this._options = null;
            this._node = null;
            this._stateCache = null;
            this._destructed = true;
        },

        /**
         * Возвращает DOM-элемент данного блока.
         *
         * @returns {jQuery}
         */
        getDomNode: function () {
            return this._node;
        },

        /**
         * Добавляет обработчик события `event` объекта `emitter`. Контекстом обработчика
         * является экземпляр данного блока. Обработчик события автоматически удалится при вызове
         * `Block.prototype.destruct()`.
         *
         * @protected
         * @param {jQuery|Block} emitter
         * @param {String} event
         * @param {Function} callback
         * @returns {Block}
         *
         * @example
         * var View = inherit(Block, {
         *     __constructor: function (model) {
         *         this.__base();
         *
         *         var hide = this._findElement('hide');
         *         this._bindTo(hide, 'click', this._onHideClick);
         *
         *         this._bindTo(model, 'change-attr', this._onAttrChange);
         *     }
         * });
         */
        _bindTo: function (emitter, event, callback) {
            this._eventManager.bindTo(emitter, event, callback);
            return this;
        },

        /**
         * Удаляет обработчик события `event` объекта `emitter`, добавленный с помощью
         * `Block.prototype._bindTo()`.
         *
         * @protected
         * @param {jQuery|Block} emitter
         * @param {String} event
         * @param {Function} callback
         * @returns {Block}
         */
        _unbindFrom: function (emitter, event, callback) {
            this._eventManager.unbindFrom(emitter, event, callback);
            return this;
        },

        /**
         * Исполняет обработчики события `blockEvent` блока. Первым аргументом в обработчики события будет
         * передан экземпляр класса `BlockEvent`.
         *
         * @param {String|BlockEvent} blockEvent Имя события или экземпляр класса `BlockEvent`.
         * @param {Object} [data] Дополнительные данные, которые можно получить через `e.data` в обработчике.
         * @returns {Block}
         *
         * @example
         * var block = new Block();
         * block.on('click', function (e) {
         *     console.log(e.type);
         * });
         *
         * block.emit('click'); // => 'click'
         *
         * var event = new BlockEvent('click');
         * block.emit(event); // => 'click'
         */
        emit: function (blockEvent, data) {
            if (typeof blockEvent === 'string') {
                blockEvent = new BlockEvent(blockEvent);
            }

            blockEvent.data = data;
            blockEvent.target = this;

            this.__base(blockEvent.type, blockEvent);

            if (!blockEvent.isPropagationStopped()) {
                // Если событие блока надо распространять, кидаем специальное событие на DOM ноде блока.
                var jqEvent = $.Event(this.__self._getPropagationEventName(blockEvent.type));
                blockEvent._jqEvent = jqEvent;
                var domNode = this.getDomNode();
                if (domNode) {
                    this.getDomNode().trigger(jqEvent, blockEvent);
                }
            }

            return this;
        },

        /**
         * Возвращает имя отображения данного блока.
         *
         * @returns {String|undefined}
         */
        getView: function () {
            if (this._cachedViewName === null) {
                var cls = this.getDomNode().attr('class');
                if (cls) {
                    this._cachedViewName = cls.split(' ').shift().split('_')[1];
                } else {
                    this._cachedViewName = undefined;
                }
            }
            return this._cachedViewName;
        },

        /**
         * Устанавливает CSS-класс по имени и значению состояния.
         * Например, для блока `button` вызов `this._setState('pressed', 'yes')`
         * добавляет CSS-класс с именем `pressed_yes`.
         *
         * С точки зрения `BEM` похож на метод `setMod`, но не вызывает каких-либо событий.
         *
         * @protected
         * @param {String} stateName Имя состояния.
         * @param {String|Boolean} [stateVal=true] Значение.
         *                                         Если указан `false` или пустая строка, то CSS-класс удаляется.
         * @returns {Block}
         */
        _setState: function (stateName, stateVal) {
            if (arguments.length === 1) {
                stateVal = true;
            }
            stateVal = getStateValue(stateVal);
            var domElem = this.getDomNode();
            if (!this._stateCache) {
                this._stateCache = this._parseStateCssClasses(domElem);
            }
            var prevStateVal = this._stateCache[stateName] || false;
            if (stateVal !== prevStateVal) {
                this._stateCache[stateName] = stateVal;
                if (prevStateVal) {
                    domElem.removeClass('_' + stateName + (prevStateVal === true ? '' : '_' + prevStateVal));
                }
                if (stateVal) {
                    domElem.addClass('_' + stateName + (stateVal === true ? '' : '_' + stateVal));
                }
            }
            return this;
        },

        /**
         * Удаляет CSS-класс состояния с заданным именем.
         * Например, для блока `button` вызов `this._removeState('side')`
         * удалит CSS-классы с именами `side_left`, `side_right` и т.п.
         *
         * С точки зрения `BEM` похож на метод `delMod`, но не вызывает каких-либо событий.
         *
         * @protected
         * @param {String} stateName
         * @returns {Block}
         */
        _removeState: function (stateName) {
            return this._setState(stateName, false); // false удаляет состояние с указанным именем
        },

        /**
         * Возвращает значение состояния на основе CSS-классов блока.
         * Например, для блока `button`, у которого на DOM-элементе висит класс `pressed_yes`,
         * вызов `this._getState('pressed')` возвратит значение `yes`.
         *
         * С точки зрения `BEM` похож на метод `getMod`.
         *
         * @protected
         * @param {String} stateName
         * @returns {String|Boolean}
         */
        _getState: function (stateName) {
            if (!this._stateCache) {
                this._stateCache = this._parseStateCssClasses(this.getDomNode());
            }
            return this._stateCache[stateName] || false;
        },

        /**
         * Переключает значение состояния блока (полученное на основе CSS-классов) между двумя значениями.
         * Например, для блока `button`, у которого на DOM-элементе висит класс `pressed_yes`,
         * вызов `this._toggleState('pressed', 'yes', '')` удалит класс `pressed_yes`,
         * а повторный вызов — вернет на место.
         *
         * С точки зрения `BEM` похож на метод `toggleMod`, но не вызывает каких-либо событий.
         *
         * @protected
         * @param {String} stateName
         * @param {String|Boolean} stateVal1
         * @param {String|Boolean} stateVal2
         * @returns {Block}
         */
        _toggleState: function (stateName, stateVal1, stateVal2) {
            stateVal1 = getStateValue(stateVal1);
            stateVal2 = getStateValue(stateVal2);
            var currentModVal = this._getState(stateName);
            if (currentModVal === stateVal1) {
                this._setState(stateName, stateVal2);
            } else if (currentModVal === stateVal2) {
                this._setState(stateName, stateVal1);
            }
            return this;
        },

        /**
         * Устанавливает CSS-класс для элемента по имени и значению состояния.
         * Например, для элемента `text` блока `button` вызов
         * `this._setElementState(this._findElement('text'), 'pressed', 'yes')`
         * добавляет CSS-класс с именем `pressed_yes`.
         *
         * С точки зрения `BEM` похож на метод `setElemMod`.
         *
         * @protected
         * @param {HTMLElement|jQuery} domNode
         * @param {String} stateName Имя состояния.
         * @param {String|Boolean} [stateVal=true] Значение.
         *                                         Если указан `false` или пустая строка, то CSS-класс удаляется.
         * @returns {Block}
         */
        _setElementState: function (domNode, stateName, stateVal) {
            if (domNode) {
                domNode = $(domNode);
                if (arguments.length === 2) {
                    stateVal = true;
                }
                stateVal = getStateValue(stateVal);
                var parsedMods = this._parseStateCssClasses(domNode);
                var prevModVal = parsedMods[stateName];
                if (prevModVal) {
                    domNode.removeClass('_' + stateName + (prevModVal === true ? '' : '_' + prevModVal));
                }
                if (stateVal) {
                    domNode.addClass('_' + stateName + (stateVal === true ? '' : '_' + stateVal));
                }
            } else {
                throw new Error('`domNode` should be specified for `_setElementState` method.');
            }
            return this;
        },

        /**
         * Удаляет CSS-класс состояния с заданным именем для элемента.
         * Например, для элемента `text` блока `button` вызов
         * `this._removeElementState(this._findElement('text'), 'side')`
         * удалит CSS-классы с именами `side_left`, `side_right` и т.п.
         *
         * С точки зрения `BEM` похож на метод `delElemMod`.
         *
         * @protected
         * @param {HTMLElement|jQuery} domNode
         * @param {String} stateName
         * @returns {Block}
         */
        _removeElementState: function (domNode, stateName) {
            // false удаляет состояние с указанным именем
            return this._setElementState(domNode, stateName, false);
        },

        /**
         * Возвращает значение состояния на основе CSS-классов элемента.
         * Например, для элемента `text` блока `button`,
         * у которого на DOM-элементе висит класс `pressed_yes`, вызов
         * `this._getElementState(this._findElement('text'), 'pressed')` возвратит значение `yes`.
         *
         * С точки зрения `BEM` похож на метод `getElemMod`.
         *
         * @protected
         * @param {HTMLElement|jQuery} domNode
         * @param {String} stateName
         * @returns {String}
         */
        _getElementState: function (domNode, stateName) {
            if (domNode) {
                domNode = $(domNode);
                var elemName = this._getElementName(domNode);
                if (elemName) {
                    return this._parseStateCssClasses(domNode)[stateName] || false;
                } else {
                    throw new Error('Unable to get BEM Element name from DOM Node.');
                }
            } else {
                throw new Error('`domNode` should be specified for `_getElementState` method.');
            }
        },

        /**
         * Переключает значение состояния элемента блока (полученное на основе CSS-классов) между двумя значениями.
         * Например, для элемента `text` блока `button`,
         * у которого на DOM-элементе висит класс `pressed_yes`, вызов
         * `this._toggleElementState(this._findElement('text'), 'pressed', 'yes', '')`
         * удалит класс `pressed_yes`, а повторный вызов — вернет на место.
         *
         * С точки зрения `BEM` похож на метод `toggleElemMod`.
         *
         * @protected
         * @param {HTMLElement|jQuery} domNode
         * @param {String} stateName
         * @param {String} stateVal1
         * @param {String} stateVal2
         * @returns {Block}
         */
        _toggleElementState: function (domNode, stateName, stateVal1, stateVal2) {
            stateVal1 = getStateValue(stateVal1);
            stateVal2 = getStateValue(stateVal2);
            var currentModVal = this._getElementState(domNode, stateName);
            if (currentModVal === stateVal1) {
                this._setElementState(domNode, stateName, stateVal2);
            } else if (currentModVal === stateVal2) {
                this._setElementState(domNode, stateName, stateVal1);
            }
            return this;
        },

        /**
         * Возвращает первый элемент с указанным именем.
         *
         * @protected
         * @param {String} elementName Имя элемента.
         * @param {HTMLElement|jQuery} [parentElement] Элемент в котором необходимо произвести поиск. Если не указан,
         *                                             то используется результат `this.getDomNode()`.
         * @returns {jQuery|undefined}
         *
         * @example
         * var title = this._findElement('title');
         * title.text('Hello World');
         */
        _findElement: function (elementName, parentElement) {
            return this._findAllElements(elementName, parentElement)[0];
        },

        /**
         * Возвращает все элементы по указанному имени.
         *
         * @protected
         * @param {String} elementName Имя элемента.
         * @param {HTMLElement|jQuery} [parentElement] Элемент в котором необходимо произвести поиск. Если не указан,
         *                                             то используется результат `this.getDomNode()`.
         * @returns {jQuery[]}
         *
         * @example
         * this._findAllElements('item').forEach(function (item) {
         *     item.text('Item');
         * });
         */
        _findAllElements: function (elementName, parentElement) {
            parentElement = parentElement ? $(parentElement) : this.getDomNode();
            var view = this.getView();
            var elems = parentElement.find(
                '.' + this.__self.getBlockName() + (view ? '_' + view : '') + '__' + elementName
            );
            var result = [];
            var l = elems.length;
            for (var i = 0; i < l; i++) {
                result.push($(elems[i]));
            }
            return result;
        },

        /**
         * Возвращает параметры, которые были переданы блоку при инициализации.
         *
         * @protected
         * @returns {Object}
         *
         * @example
         * var control = Control.fromDomNode(
         *     $('<div class="control _init" onclick="return {\'control\':{level:5}}"></div>')
         * );
         * // control:
         * inherit(Block, {
         *     myMethod: function() {
         *         console.log(this._getOptions().level);
         *     }
         * }, {
         *     getBlockName: function() {
         *         return 'control';
         *     }
         * });
         */
        _getOptions: function () {
            return this._options;
        },

        /**
         * Возвращает параметры, которые были переданы элементу блока при инициализации.
         *
         * @protected
         * @param {HTMLElement|jQuery} domNode
         * @returns {Object}
         *
         * @example
         * // HTML:
         * // <div class="control _init">
         * //     <div class="control__text" data-options="{options:{level:5}}"></div>
         * // </div>
         *
         * provide(inherit(Block, {
         *     __constructor: function() {
         *         this.__base.apply(this, arguments);
         *         this._textParams = this._getElementOptions(this._findElement('text'));
         *     }
         * }, { getBlockName: function() { return 'control'; } }));
         */
        _getElementOptions: function (domNode) {
            if (domNode) {
                domNode = $(domNode);
                var elemName = this._getElementName(domNode);
                if (elemName) {
                    return this.__self._getDomNodeOptions(domNode).options || {};
                } else {
                    throw new Error('Unable to get BEM Element name from DOM Node.');
                }
            } else {
                throw new Error('`domNode` should be specified for `_getElementOptions` method.');
            }
        },

        /**
         * Создает и возвращает DOM-элемент на основе BH-опций.
         * Создание нового элемента осуществляется с помощью применения BH-шаблонов.
         *
         * @protected
         * @param {Object} params
         * @returns {jQuery}
         */
        _createDomElement: function (params) {
            return $(bt.apply(extend({}, params, {block: this.__self.getBlockName()})));
        },

        /**
         * Разбирает состояния DOM-элемента, возвращает объект вида `{stateName: stateVal, ...}`.
         *
         * @private
         * @param {jQuery} domNode
         * @returns {Object}
         */
        _parseStateCssClasses: function (domNode) {
            var result = {};
            var classAttr = domNode.attr('class');
            if (classAttr) {
                var classNames = classAttr.split(' ');
                for (var i = classNames.length - 1; i >= 0; i--) {
                    if (classNames[i].charAt(0) === '_') {
                        var classNameParts = classNames[i].substr(1).split('_');
                        if (classNameParts.length === 2) {
                            result[classNameParts[0]] = classNameParts[1];
                        } else {
                            result[classNameParts[0]] = true;
                        }
                    }
                }
            }
            return result;
        },

        /**
         * Возвращает имя элемента блока на основе DOM-элемента.
         *
         * @private
         * @param {jQuery} domNode
         * @returns {String|null}
         */
        _getElementName: function (domNode) {
            var view = this.getView();
            var match = (domNode[0].className || '').match(
                new RegExp(this.__self.getBlockName() + (view ? '_' + view : '') + '__([a-zA-Z0-9-]+)(?:\\s|$)')
            );
            return match ? match[1] : null;
        }
    }, {
        /**
         * Возвращает имя блока.
         * Этот метод следует перекрывать при создании новых блоков.
         *
         * @static
         * @returns {String|null}
         *
         * @example
         * provide(inherit(Block, {}, {
         *     getBlockName: function() {
         *         return 'my-button';
         *     }
         * });
         */
        getBlockName: function () {
            return 'block';
        },

        /**
         * Возвращает инстанцию блока для переданного DOM-элемента.
         *
         * @static
         * @param {HTMLElement|jQuery} domNode
         * @param {Object} [params]
         * @returns {Block}
         *
         * @example
         * var page = Page.fromDomNode(document.body);
         */
        fromDomNode: function (domNode, params) {
            if (!domNode) {
                throw new Error('`domNode` should be specified for `findDomNode` method');
            }
            var blockName = this.getBlockName();
            domNode = $(domNode);
            if (!domNode.length) {
                throw new Error('Cannot initialize "' + blockName + '" from empty jQuery object');
            }
            var nodeStorage = this._getDomNodeDataStorage(domNode);
            var instance = nodeStorage.blocks[blockName];
            if (!instance) {
                domNode.addClass(this._autoInitCssClass);
                if (params === undefined) {
                    params = this._getDomNodeOptions(domNode).options || {};
                }
                params.__complete = true;
                var BlockClass = this;
                instance = new BlockClass(domNode, params);
            }
            return instance;
        },

        /**
         * Инициализирует блок, если это необходимо.
         * Возвращает `null` для блоков с отложенной (`live`) инициализацией и инстанцию блока для прочих.
         *
         * @static
         * @param {HTMLElement|jQuery} domNode
         * @param {Object} params
         * @returns {Block|null}
         */
        initOnDomNode: function (domNode, params) {
            var initBlock;
            if (this._liveInit) {
                this._liveInitIfRequired();
                initBlock = false;
                if (this._instantInitHandlers) {
                    for (var i = 0, l = this._instantInitHandlers.length; i < l; i++) {
                        if (this._instantInitHandlers[i](params, domNode)) {
                            initBlock = true;
                            break;
                        }
                    }
                }
            } else {
                initBlock = true;
            }
            if (initBlock) {
                domNode = $(domNode);
                return this.fromDomNode(domNode, params);
            } else {
                return null;
            }
        },

        /**
         * Запускает `live`-инициализацию, если она определена для блока и не была выполнена ранее.
         *
         * @static
         * @protected
         */
        _liveInitIfRequired: function () {
            var blockName = this.getBlockName();
            if (this._liveInit && (!this._liveInitialized || !this._liveInitialized[blockName])) {
                this._liveInit();
                (this._liveInitialized = this._liveInitialized || {})[blockName] = true;
            }
        },

        /**
         * Если для блока требуется отложенная (`live`) инициализация,
         * следует перекрыть это свойство статическим методом.
         *
         * Этот выполняется лишь однажды, при инициализации первого блока на странице.
         *
         * В рамках `_liveInit` можно пользоваться методами `_liveBind` и `_liveBindToElement` для того,
         * чтобы глобально слушать события на блоке и элементе соответственно.
         *
         * @static
         * @protected
         * @type {Function|null}
         *
         * @example
         * var MyBlock = inherit(Block, {}, {
         *     _liveInit: function () {
         *         this._liveBind('click', function(e) {
         *             this._setState('clicked', 'yes');
         *         });
         *         this._liveBindToElement('title', 'click', function(e) {
         *             this._setElementState($(e.currentTarget), 'clicked', 'yes');
         *         });
         *     }
         * });
         */
        _liveInit: null,

        /**
         * Отменяет отложенную инициализацию блока по определенному условию.
         * Условием служит функция, которая принимает параметры и DOM-элемент блока. Если функция возвращает true,
         * то блок инициализируется сразу.
         * Рекомендуется для таких случаев передавать нужные параметры, которые сигнализируют о том,
         * что блок необходимо инициализировать блок сразу.
         *
         * @static
         * @protected
         * @param {Function<Object,jQuery>} condition
         */
        _instantInitIf: function (condition) {
            if (!this._instantInitHandlers) {
                this._instantInitHandlers = [];
            }
            this._instantInitHandlers.push(condition);
        },

        /**
         * Глобально слушает событие на блоке. Используется при отложенной инициализации.
         * Обработчик события выполнится в контексте инстанции блока.
         *
         * @static
         * @protected
         * @param {String} eventName
         * @param {Function} handler
         */
        _liveBind: function (eventName, handler) {
            var blockClass = this;
            this._getLiveEventsScopeElement().on(eventName, '[data-block="' + this.getBlockName() + '"]', function (e) {
                handler.call(blockClass.fromDomNode(e.currentTarget), e);
            });
        },

        /**
         * Глобально слушает событие на элементе блока. Используется при отложенной инициализации.
         * Обработчик события выполнится в контексте инстанции блока.
         *
         * @static
         * @protected
         * @param {String} elementName
         * @param {String} eventName
         * @param {Function} handler
         */
        _liveBindToElement: function (elementName, eventName, handler) {
            var blockClass = this;
            var blockName = this.getBlockName();
            var selectors = [
                '[class^="' + blockName + '_"][class$="__' + elementName + '"]',
                '[class^="' + blockName + '_"][class*="__' + elementName + ' "]'
            ];
            this._getLiveEventsScopeElement().on(
                eventName,
                selectors.join(', '),
                function (e) {
                    handler.call(
                        blockClass.fromDomNode($(e.currentTarget).closest('[data-block="' + blockName + '"]')),
                        e
                    );
                }
            );
        },

        /**
         * Возвращает элемент, на котором будут слушаться глобальные (`live`) события.
         *
         * @static
         * @protected
         * @returns {jQuery}
         */
        _getLiveEventsScopeElement: function () {
            return $(document.body);
        },

        /**
         * Уничтожает инстанцию блока на переданном DOM-элементе.
         *
         * @static
         * @param {HTMLElement|jQuery} domNode
         */
        destructOnDomNode: function (domNode) {
            domNode = $(domNode);
            var blockName = this.getBlockName();
            var nodeStorage = this._getDomNodeDataStorage(domNode, true);
            if (nodeStorage && nodeStorage.blocks[blockName]) {
                var instance = nodeStorage.blocks[blockName];
                if (!instance._destructed) {
                    instance.destruct();
                }
                delete nodeStorage.blocks[blockName];
            }
        },

        /**
         * Возвращает первую инстанцию блока внутри переданного фрагмента DOM-дерева.
         *
         * @static
         * @param {jQuery|HTMLElement|Block} parentElement
         * @returns {Block|undefined}
         *
         * @example
         * var input = Input.find(document.body);
         * if (input) {
         *     input.setValue('Hello World');
         * } else {
         *     throw new Error('Input wasn\'t found in "control".');
         * }
         */
        find: function (parentElement) {
            return this.findAll(parentElement)[0];
        },

        /**
         * Возвращает все инстанции блока внутри переданного фрагмента DOM-дерева.
         *
         * @static
         * @param {jQuery|HTMLElement|Block} parentElement
         * @returns {Block[]}
         *
         * @example
         * var inputs = Input.findAll(document.body);
         * inputs.forEach(function (input) {
         *     input.setValue("Input here");
         * });
         */
        findAll: function (parentElement) {
            if (!parentElement) {
                throw new Error('`parentElement` should be specified for `findAll` method');
            }

            parentElement = this._getDomNodeFrom(parentElement);

            var domNodes = parentElement.find('[data-block=' + this.getBlockName() + ']');
            if (domNodes.length) {
                var result = [];
                var l = domNodes.length;
                for (var i = 0; i < l; i++) {
                    var domNode = $(domNodes[i]);
                    result.push(this.fromDomNode(domNode));
                }
                return result;
            } else {
                return [];
            }
        },

        /**
         * Инициализирует все блоки на переданном фрагменте DOM-дерева.
         *
         * @static
         * @param {HTMLElement|jQuery|Block} domNode
         * @returns {Promise}
         *
         * @example
         * Block.initDomTree(document.body).done(function () {
         *     Button.getEmitter(document.body).on('click', function () {
         *         alert("Button is clicked");
         *     });
         * });
         */
        initDomTree: function (domNode) {
            if (!domNode) {
                throw new Error('`domNode` should be specified for `initDomTree` method');
            }
            domNode = this._getDomNodeFrom(domNode);
            var selector = '.' + this._autoInitCssClass;
            var classesToLoad = {};
            var nodes = domNode.find(selector);

            if (domNode.is(selector)) {
                Array.prototype.unshift.call(nodes, domNode);
            }
            var tasks = [];

            var l = nodes.length;
            for (var i = 0; i < l; i++) {
                var node = $(nodes[i]);
                var params = this._getDomNodeOptions(node) || {};

                var blockName = node.attr('data-block');
                if (blockName) {
                    tasks.push({
                        node: node,
                        className: blockName,
                        options: params.options || {},
                        isMixin: false
                    });
                    classesToLoad[blockName] = null;
                    var mixins = params.mixins;
                    if (mixins) {
                        for (var j = 0, jl = mixins.length; j < jl; j++) {
                            var mixinData = mixins[j];
                            if (mixinData && mixinData.name) {
                                tasks.push({
                                    node: node,
                                    className: mixinData.name,
                                    blockName: blockName,
                                    options: mixinData,
                                    isMixin: true
                                });
                                classesToLoad[mixinData.name] = null;
                            }
                        }
                    }
                }
            }

            function loadModule(moduleName) {
                var promise = vow.promise();
                if (modules.isDefined(moduleName)) {
                    modules.require([moduleName], function (moduleClass) {
                        classesToLoad[moduleName] = moduleClass;
                        promise.fulfill();
                    });
                    return promise;
                } else {
                    return null;
                }
            }

            return vow.fulfill().then(function () {
                return vow.all(Object.keys(classesToLoad).map(function (className) {
                    return loadModule(className);
                })).then(function () {
                    var l = tasks.length;
                    for (var i = 0; i < l; i++) {
                        var task = tasks[i];
                        var node = task.node;
                        var className = task.className;
                        var options = task.options;
                        var classDef = classesToLoad[className];
                        if (classDef) {
                            try {
                                if (task.isMixin) {
                                    var blockClass = classesToLoad[task.blockName];
                                    if (blockClass) {
                                        classDef.fromBlock(blockClass.fromDomNode(node), options);
                                    }
                                } else {
                                    classDef.initOnDomNode(node, options);
                                }
                            } catch (e) {
                                e.message = className + ' init error: ' + e.message;
                                throw e;
                            }
                        }
                    }
                });
            });
        },

        /**
         * Уничтожает все инстанции блоков на переданном фрагменте DOM-дерева.
         *
         * @static
         * @param {HTMLElement|jQuery|Block} domNode
         */
        destructDomTree: function (domNode) {
            if (!domNode) {
                throw new Error('`domNode` should be specified for `destructDomTree` method');
            }
            domNode = this._getDomNodeFrom(domNode);

            var selector = '.' + this._autoInitCssClass + ',.' + this._delegateEventsCssClass;
            var nodes = domNode.find(selector);

            if (domNode.is(selector)) {
                Array.prototype.unshift.call(nodes, domNode);
            }

            for (var i = 0; i < nodes.length; i++) {
                var node = $(nodes[i]);
                var nodeStorage = this._getDomNodeDataStorage(node, true);
                if (nodeStorage) {
                    var blocks = nodeStorage.blocks;
                    for (var blockName in blocks) {
                        if (blocks.hasOwnProperty(blockName)) {
                            blocks[blockName].__self.destructOnDomNode(node);
                        }
                    }
                    nodeStorage.blocks = {};
                    var blockEvents = nodeStorage.blockEvents;
                    for (blockName in blockEvents) {
                        if (blockEvents.hasOwnProperty(blockName)) {
                            blockEvents[blockName].offAll();
                        }
                    }
                    nodeStorage.blockEvents = {};
                }
            }
        },

        /**
         * Возвращает эмиттер событий блока для переданного DOM-элемента.
         * На полученном эмиттере можно слушать блочные события, которые будут всплывать до этого DOM-элемента.
         *
         * @static
         * @param {HTMLElement|jQuery|Block} domNode
         * @returns {EventEmitter}
         *
         * @example
         * Button.getEmitter(document.body).on('click', function () {
         *     alert('Button is clicked');
         * });
         */
        getEmitter: function (domNode) {
            domNode = this._getDomNodeFrom(domNode);

            var nodeStorage = this._getDomNodeDataStorage(domNode);
            var blockName = this.getBlockName();
            var emitter = nodeStorage.blockEvents[blockName];

            if (!emitter) {
                domNode.addClass(this._delegateEventsCssClass);
                emitter = new BlockEventEmitter(this, domNode);
                nodeStorage.blockEvents[blockName] = emitter;
            }

            return emitter;
        },

        /**
         * Возвращает jQuery DOM-элемент используя HTMLElement, инстанцию блока или другой jQuery-элемент.
         *
         * @static
         * @protected
         * @param {jQuery|HTMLElement|Block} domNode
         * @returns {Block}
         */
        _getDomNodeFrom: function (domNode) {
            if (domNode) {
                if (domNode instanceof Block) {
                    domNode = domNode.getDomNode();
                }
                domNode = $(domNode);
            } else {
                throw new Error('jQuery element, DOM Element or Block instance should be specified');
            }
            return domNode;
        },

        /**
         * Возвращает опции блока или элемента на указанном DOM-элементе.
         *
         * @static
         * @private
         * @param {jQuery} domNode
         */
        _getDomNodeOptions: function (domNode) {
            var options = domNode.attr('data-options');
            return options ? JSON.parse(options) : {};
        },

        /**
         * Возвращает хранилище данных для DOM-элемента.
         *
         * @static
         * @private
         * @param {jQuery} domNode
         * @param {Boolean} [skipCreating]
         * @returns {Object}
         */
        _getDomNodeDataStorage: function (domNode, skipCreating) {
            var data = domNode.data('block-storage');
            if (!data && !skipCreating) {
                data = {
                    blocks: {},
                    blockEvents: {}
                };
                domNode.data('block-storage', data);
            }
            return data;
        },

        /**
         * Возвращает специальное имя события, которое используется для распространения события блока по DOM дереву.
         *
         * @static
         * @private
         * @param {String} eventName Имя события блока.
         * @returns {String}
         */
        _getPropagationEventName: function (eventName) {
            return 'block/' + this.getBlockName() + '/' + eventName;
        },

        /**
         * CSS-класс для автоматической инициализации.
         *
         * @static
         * @private
         * @type {String}
         */
        _autoInitCssClass: '_init',

        /**
         * CSS-класс для делегирования событий.
         *
         * @static
         * @private
         * @type {String}
         */
        _delegateEventsCssClass: '_live-events'
    });

    /**
     * Эмиттер, используемый для делегирования событий блока.
     *
     * Делегирование событий блока происходит следующим образом:
     * - Когда блок инициирует событие `eventName`, он также инциирует событие `block/blockName/eventName`
     *   на DOM ноде блока. Это событие распространяется вверх по DOM дереву.
     *
     * - При добавлении нового события в `BlockEventEmitter`, для переданной DOM ноды добавляется обработчик события
     *   `block/blockName/eventName`, который инициирует в эмиттере событие `eventName`.
     *
     * - При удалении события из `BlockEventEmitter`, соответствующий обработчик удаляется из DOM ноды. Тем самым
     *   прекращается делегирование.
     */
    var BlockEventEmitter = inherit(EventEmitter, {
        /**
         * Создает эмиттер событий, который позволяет слушать события экземпляров блока `blockClass`
         * на DOM ноде `domNode`.
         *
         * @param {Function} blockClass
         * @param {jQuery} domNode
         */
        __constructor: function (blockClass, domNode) {
            this._blockClass = blockClass;
            this._domNode = domNode;
            this._listeners = {};
        },

        _onAddEvent: function (eventName) {
            var _this = this;
            function listener(jqEvent, blockEvent) {
                _this.emit(eventName, blockEvent);
                if (blockEvent.isPropagationStopped()) {
                    jqEvent.stopPropagation();
                }
            }

            var propagationEventName = this._blockClass._getPropagationEventName(eventName);
            this._domNode.on(propagationEventName, listener);
            this._listeners[eventName] = listener;
        },

        _onRemoveEvent: function (eventName) {
            var propagationEventName = this._blockClass._getPropagationEventName(eventName);
            this._domNode.off(propagationEventName, this._listeners[eventName]);
            delete this._listeners[eventName];
        }
    });

    function getStateValue(stateVal) {
        if (typeof stateVal === 'string') {
            if (stateVal === '') {
                stateVal = false;
            }
        } else {
            if (typeof stateVal === 'number') {
                stateVal = String(stateVal);
            } else {
                stateVal = Boolean(stateVal);
            }
        }
        return stateVal;
    }

    provide(Block);
});
