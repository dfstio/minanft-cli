"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.password = void 0;
const cli_1 = require("./cli");
function password() {
    const pwd = cli_1.program.opts().password;
    return pwd ?? process.env.MINANFT_PASSWORD ?? undefined;
}
exports.password = password;
