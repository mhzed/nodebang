"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bang_1 = require("../src/bang");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const process_1 = require("process");
const indir = (directory, action) => __awaiter(this, void 0, void 0, function* () {
    const cdir = process_1.cwd();
    process_1.chdir(directory);
    yield action();
    process_1.chdir(cdir);
});
describe('nodebang', () => {
    it('basic', () => __awaiter(this, void 0, void 0, function* () {
        const testdir = path_1.resolve(__dirname, "testproj");
        yield fs_extra_1.mkdirp(testdir);
        yield indir(testdir, () => __awaiter(this, void 0, void 0, function* () {
            yield bang_1.bangBasic();
            yield bang_1.bangTypescript();
        }));
        yield fs_extra_1.emptyDir(testdir);
    }));
});
//# sourceMappingURL=test.js.map