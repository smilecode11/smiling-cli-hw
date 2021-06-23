# smiling-cli-hw 脚手架作业库


## core 准备阶段开发
**[时间: 2021年06月17日22:36:10]**
主要涉及目录
-   core
-   utils
    + log
    + get-npm-info

### 检查版本号
require('package.json').version 获取 core 版本

### 检查 node 版本
-   semver 版本对比库使用

### 检查 root 启动
-   check-root 库使用
### 检查用户主目录
-   user-home 库使用
### 检查入参
-   minimist 库使用, 更好的获取入参
### 检查环境变量
-   doenv 库的使用
### 检查是否为最新版本
-   get-npm-info 模块开发
    + axios 库使用
### 检查更新
-   node 版本对比
    +   semver 库的使用
    +   get-npm-info 获取最新版本函数开发

### command 基础命令开发
-   脚手架启动阶段执行
    +   检查版本号
    +   检查 node 版本
    +   检查 root 启动
    +   检查用户主目录
    +   检查环境变量
    +   检查 cli 最新版本, 非最新并提示更新

-   command 开发 debug & log 环境

### 高性能脚手架设计和开发

#### 动态加载 initCommand 开发 