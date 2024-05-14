"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offline = void 0;
const cli_1 = require("./cli");
function offline() {
    return cli_1.program.opts().offline ?? false;
}
exports.offline = offline;
