'use strict';

module.exports = core;

const pkg = require("../package.json");
const log = require("@smiling-cli-hw/log");
const constant = require("./const");
const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const pathExists = require("path-exists")

let args;

function core(argv) {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs()
        checkEnv()
        checkGlobalUpdate()
    } catch (e) {
        log.error(e.message)
    }
}

/** 检查脚手架版本*/
function checkPkgVersion() {
    log.success(pkg.version)
}

/** 检查当前 node 版本 & 最低版本设置*/
function checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = constant.LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`smiling-cli-hw 需要安装 v${lowestVersion} 以上版本的 node, 当前版本是 ${currentVersion}`))
    }
}

/** 检查 root 权限*/
function checkRoot() {
    const rootCheck = require("root-check");
    rootCheck()
}

/** 检查用户主目录*/
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red("当前登录用户目录不存在"))
    }
}

/** 检查入参*/
function checkInputArgs() {
    const minimist = require("minimist");
    args = minimist(process.argv.slice(2))
    /** 检查入参设定 log 模式*/
    checkArgs()
}

function checkArgs() {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
}

/** 检查环境变量*/
function checkEnv() {
    const dotenv = require("dotenv");
    const dotenvPath = path.resolve(userHome, '.env')
    if (pathExists(dotenvPath)) {
        dotenv.config({
            path: dotenvPath
        })
    }
    createDefaultEnvConfig()
    log.verbose('缓存地址', process.env.CLI_HOME_PATH)
}

function createDefaultEnvConfig() {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig['cliHome'];
}

/** 检查全局更新 版本对比, 提示用户更新到最新版本*/
async function checkGlobalUpdate() {
    const currentVersion = pkg.version;
    const npmName = pkg.name;
    const {
        getNpmSemverVersion
    } = require("@smiling-cli-hw/get-npm-info")
    const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
    if (lastVersion && semver.gt(lastVersion, currentVersion)) {
        log.warn(colors.yellow(`请手动更新 ${npmName}, 当前版本 ${currentVersion}, 最新版本是 ${lastVersion}.`))
    }
}