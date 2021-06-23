/**
 * package models 包管理 model
 * create-time: 2021年06月23日22:44:28
 */
'use strict';

const path = require("path");
const pkgDir = require("pkg-dir").sync;
const npminstall = require("npminstall");
const pathExists = require("path-exists");
const fse = require("fs-extra");
const formatPath = require('@smiling-cli-hw/format-path');
const {
    isObject
} = require("@smiling-cli-hw/utils");
const {
    getDefaultRegistry,
    getNpmLatestVersion
} = require("@smiling-cli-hw/get-npm-info");


class Package {
    constructor(options) {
        //  参数验证
        if (!options) {
            throw new Error("Package 类的 options 参数不能为空");
        }
        if (!isObject(options)) {
            throw new Error("Package 类的 options 参数必须是对象!");
        }
        this.targetPath = options.targetPath;
        this.storeDir = options.storeDir;
        this.packageName = options.packageName;
        this.packageVersion = options.packageVersion;
        this.catchFilePathPrefix = this.packageName.replace("/", '_'); // 包的缓存目录前缀设置
    }

    get catchFilePath() {
        return path.resolve(this.storeDir, `_${this.catchFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
    }

    /** 获取指定版本的缓存路径地址*/
    getSpecifyCacheFilePath(version) {
        return path.resolve(this.storeDir, `_${this.catchFilePathPrefix}@${version}@${this.packageName}`);
    }

    /** 版本检查赋值及缓存目录地址创建*/
    async prepare() {
        if (this.storeDir && !pathExists(this.storeDir)) {
            fse.mkdirpSync(this.storeDir);
        }
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName)
        }
    }

    /** 包是否存在*/
    async exist() {
        if (this.storeDir) {
            await this.prepare();
            return pathExists(this.catchFilePath);
        } else {
            return pathExists(this.targetPath);
        }
    }

    /** 下载*/
    async install() {
        await this.prepare();
        return npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [{
                name: this.packageName,
                version: this.packageVersion
            }]
        })
    }

    /** 更新|查找缓存路径, 不存在直接安装, 存在对比是否最新版本安装*/
    async update() {

        await this.prepare();
        const latestPackageVersion = await getNpmLatestVersion(this.packageName);
        const latestFilePath = this.getSpecifyCacheFilePath(latestPackageVersion);
        if (!pathExists(latestFilePath)) {
            await npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [{
                    name: this.packageName,
                    version: latestPackageVersion
                }]
            })
            this.packageVersion = latestPackageVersion;
        }
    }

    /** 获取包的入口地址*/
    getRootFilePath() {
        if (this.storeDir) {
            return _getTargetPath(this.catchFilePath);
        } else {
            return _getTargetPath(this.targetPath);
        }

        function _getTargetPath(targetPath) {
            const dir = pkgDir(targetPath);
            if (dir) {
                const pkgFile = require(path.resolve(dir, 'package.json'));
                if (pkgFile && pkgFile.main) {
                    return formatPath(path.resolve(dir, pkgFile.main))
                }
            }
        }
    }
}

module.exports = Package;