'use strict';

const semver = require("semver");
const colors = require("colors/safe");
const LOWEST_NODE_VERSION = "12.0.1";

class Command {
    constructor(argv) {
        if (!argv) {
            throw new Error("Command构造函数传参不能为空!")
        }
        if (!Array.isArray(argv)) {
            throw new Error("Command构造函数传参必须是数组!")
        }
        if (argv.length < 1) {
            throw new Error("Command构造函数参数缺失!")
        }

        this._argv = argv;
        this.runner = new Promise((resolve, reject) => {
            const chain = Promise.resolve();
            chain.then(() => this.initArgs());
            chain.then(() => this.checkNodeVersion());
            chain.then(() => this.init());
            chain.then(() => this.exec());

            chain.catch(err => {
                log.error(err.message);
            })
        })
    }

    /** 初始化参数*/
    initArgs() {
        this._cmd = this._argv[this._argv.length - 1];
        this._argv = this._argv.slice(0, this._argv.length - 1);
    }

    /** node 版本检查*/
    checkNodeVersion() {
        const currentVersion = process.version;
        const lowestVersion = LOWEST_NODE_VERSION;
        if (!semver.gte(currentVersion, lowestVersion)) {
            throw new Error(colors.red(`smiling-cli-hw 需要安装 v${lowestVersion} 以上版本的 Node 予以支持, 当前版本 ${currentVersion}!`))
        }
    }

    init() {
        throw new Error("Command 子类缺少 init 方法!")
    }

    exec() {
        throw new Error("Command 子类缺少 exec 方法!")
    }
}

module.exports = Command;