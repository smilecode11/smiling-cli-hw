'use strict';

module.exports = core;

const pkg = require("../package.json");
const log = require("@smiling-cli-hw/log");
const exec = require("@smiling-cli-hw/exec");
const constant = require("./const");
const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const commander = require("commander");
let program = new commander.Command();

async function core() {
    try {
        prepare() //  主流程检查
        registerCommands() //  命令注册
    } catch (e) {
        if (process.env.LOG_LEVEL === 'verbose') {
            log.error(e.message);
        }
    }
}

/** 命令注册*/
function registerCommands() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d, --debug', '是否开启调试模式', false)
        .option('-tp, --targetPath <targetPath>', "是否指定本地调试文件目录", "");

    //  init 命令监听
    program
        .command("init [programName]")
        .option('-f, --force', '是否强制初始化项目')
        .action(exec)

    //  环境存储 targetPath
    program.on("option:targetPath", function () {
        process.env.CLI_TARGET_PATH = program.opts().targetPath;
    })

    //  debug option监听
    program.on("option:debug", function () {
        if (program.opts().debug) {
            process.env.LOG_LEVEL = 'verbose';
        } else {
            process.env.LOG_LEVEL = 'info';
        }
        log.level = process.env.LOG_LEVEL;
    })

    //  未知命令处理|提示无效命令,并展示可用命令
    program.on("command:*", function (obj) {
        const availableCommands = program.commands.map(cmd => cmd.name());
        console.log(colors.red(`未知命令: ${obj[0]}`));
        if (availableCommands.length > 0) {
            console.log(colors.red(`可用命令: ${availableCommands.join(",")}`));
        }
    })

    //  help 帮助返回
    if (process.argv.length < 3) {
        program.outputHelp();
        console.log();
    }


    program.parse(process.argv);
}

/** 初始化检查准备*/
async function prepare() {
    checkPkgVersion()
    // checkNodeVersion()
    checkRoot()
    checkUserHome()
    // checkInputArgs()
    checkEnv()
    await checkGlobalUpdate()
}

/** 检查脚手架版本*/
function checkPkgVersion() {
    log.success(pkg.version)
}

/** 检查当前 node 版本 & 最低版本设置*/
/* function checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = constant.LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`smiling-cli-hw 需要安装 v${lowestVersion} 以上版本的 node, 当前版本是 ${currentVersion}`))
    }
} */

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

/** 检查环境变量*/
function checkEnv() {
    const dotenv = require("dotenv");
    const dotenvPath = path.resolve(userHome, '.env');
    if (pathExists(dotenvPath)) {
        dotenv.config({
            path: dotenvPath
        })
    }
    createDefaultEnvConfig();
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