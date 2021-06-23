'use strict';

const path = require("path");

/** 格式化 path 路径, 兼容 macOS 和 windows 
 * @param {String} 需要格式路径
 * @returns {String} 返回格式化后的路径
 */
function formatPath(p) {
    if (p && (typeof p === 'string')) {
        const sep = path.sep;
        if (sep === '/') {
            return p;
        } else {
            return p.replace(/\\/g, '/');
        }
    }
    return p;
}

module.exports = formatPath;