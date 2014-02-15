exports.get = function (name) {
    return require('../configs/current/' + name);
};
