/**
 * 命令处理 execCommand
 * create-time:2021年06月23日22:25:37
 */
'use strict';

const path = require("path");
const cp = require("child_process");
const log = require("@smiling-cli-hw/log");
const Package = require("@smiling-cli-hw/package");

const PACKAGES_SETTINGS = {
    "init": "@smiling-cli-hw/init"
};

const CATCHE_DIR = 'dependencies';

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let pkg;
    let storeDir = '';
    let packageVersion = 'latest';

    log.verbose("targetPath:", targetPath);
    log.verbose("homePath:", homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = PACKAGES_SETTINGS[cmdName];

    log.verbose("cmdName:", cmdName);
    log.verbose("packageName:", packageName);

    if (!targetPath) { //  未指定目录, 更新 homePath 下的 .imooc-cli-hw 缓存
        targetPath = path.resolve(homePath, CATCHE_DIR);
        storeDir = path.resolve(targetPath, 'node_modules');

        log.verbose("targetPath:", targetPath);
        log.verbose("storeDir:", storeDir);

        pkg = new Package({
            targetPath,
            storeDir,
            packageVersion,
            packageName
        })
        // 更新或下载最新包
        if (await pkg.exist()) {
            await pkg.update();
        } else {
            await pkg.install();
        }
    } else {
        pkg = new Package({
            targetPath,
            packageVersion,
            packageName
        })
    }
    const rootFile = pkg.getRootFilePath();
    log.verbose("rootFile:", rootFile);
    if (rootFile) {
        try {
            //  主进程直接进行 npm package 的引入和使用
            // require(rootFile).call(null, Array.from(arguments));
            //  使用 node 多进程进行
            const args = Array.from(arguments);
            const o = Object.create(null);
            const cmd = args[args.length - 1];
            Object.keys(cmd).forEach(key => {
                if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
                    o[key] = cmd[key];
                }
            })
            args[args.length - 1] = o;
            const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`
            const child = spawn("node", ['-e', code], {
                stdio: "inherit"
            })
            child.on('error', (e) => {
                log.error(e.message);
                process.exit(1);
            })
            child.on('exit', (e) => {
                log.verbose(`命令执行成功`, e);
                process.exit(0);
            })
        } catch (e) {
            log.error(e.message);
        }
    }
}

/** win32 spawn 兼容*/
function spawn(command, args, options) {
    const win32 = process.platform === 'win32';
    const cmd = win32 ? 'cmd' : command;
    const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
    return cp.spawn(cmd, cmdArgs, options || {});
}

module.exports = exec;