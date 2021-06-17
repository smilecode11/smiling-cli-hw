'use strict';

const log = require('npmlog')

// 根据环境变量开启 debug 模式, 设定 log 等级实现
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

//  前缀定制 header & 样式修改 
log.heading = "smiling-cli-hw"
log.headingStyle = {
    fg: 'black',
    bg: 'white'
}
//  自定义命令添加 success
log.addLevel('success', 2000, {
    fg: "green",
    blod: true
})

module.exports = log;