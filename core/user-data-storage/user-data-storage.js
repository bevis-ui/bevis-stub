modules.define(
    'user-data-storage',
    ['inherit'],
    function (provide, inherit) {

    var UserDataStorage = inherit({
        __constructor: function () {
            var key = '__localStorageTest';
            try {
                localStorage.setItem(key, key);
                localStorage.removeItem(key);
                this._storage = localStorage;
            } catch(e) {
                this._storage = {};
            }
        },

        getValue: function (key) {
            var value = this._storage[key];
            return value === undefined ? undefined : JSON.parse(value);
        },

        setValue: function (key, value) {
            this._storage[key] = JSON.stringify(value);
        }
    });
    provide(UserDataStorage);
});
