'use strict';

/** 判断目标是否是对象
 * @param {*} 需要判断的目标
 * @returns {Boolean} 是返回 true,否则返回 false
*/
function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = {
    isObject
}