'use strict';

const Command = require("@smiling-cli-hw/command");
const log = require("@smiling-cli-hw/log");

class InitCommand extends Command {
    init() {
        console.log("InitCommand class init func:", this._argv);
        this.projectName = this._argv[0] || '';
        this.force = this._argv[1]['force'] || false;
        log.verbose('projectName:', this.projectName);
        log.verbose('force:', this.force);
    }

    exec() {
        log.verbose("InitCommand exec");
    }
}

function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;