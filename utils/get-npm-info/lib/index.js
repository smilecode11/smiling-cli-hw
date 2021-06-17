'use strict';

const axios = require("axios");
const semver = require("semver");
const urlJoin = require("url-join");

/** 获取 npm 信息*/
async function getNpmInfo(npmName, registry) {
    if (!npmName) {
        return null
    }
    const registryUrl = registry || getDefaultRegistry();
    const npmInfoUrl = urlJoin(registryUrl, npmName);
    return await axios.get(npmInfoUrl).then((resp) => {
        if (resp.status === 200) {
            return resp.data;
        }
        return null;
    }).catch(err => Promise.reject(err));
}

function getDefaultRegistry(isOriginal = false) {
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

/** 获取 npm 信息的版本号*/
async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry);
    if (data) {
        return Object.keys(data.versions);
    } else {
        return [];
    }
}

/** 获取大于当前版本号的列表*/
function getNpmSemverVersions(baseVersion, versions) {
    versions = versions
        .filter(version => semver.satisfies(version, `>=${baseVersion}`)) //  筛选大于等于当前版本号的列表
        .sort((a, b) => semver.gt(b, a)); //  对列表进行排序
    return versions;
}

/** 获取推荐列表*/
async function getNpmSemverVersion(baseVersion, npmName, registry) {
    const versions = await getNpmVersions(npmName, registry);
    const newVersions = getNpmSemverVersions(baseVersion, versions);
    if (newVersions && newVersions.length > 0) {
        return newVersions[0];
    } else {
        return null
    }
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersion
}