"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const util_1 = require("util");
const child_process_1 = __importDefault(require("child_process"));
const getCoverage_1 = require("./getCoverage");
const exec = util_1.promisify(child_process_1.default.exec);
const getCoverageFile = () => {
    let coverage;
    try {
        coverage = require('./coverage-compare/coverage-summary.json');
    }
    catch (_a) {
        console.log(`no coverage found`);
    }
    return coverage;
};
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get branch coverage
            const { stdout: currentBranchName } = yield exec(`git rev-parse --abbrev-ref HEAD`);
            console.log('currentBranchName', currentBranchName);
            yield exec(`git checkout -f ${process.env.GITHUB_BASE_REF}`);
            console.log('branch', yield exec(`git rev-parse --abbrev-ref HEAD`));
            const baseCoverage = getCoverageFile();
            yield exec(`git checkout -f ${currentBranchName}`);
            const branchCoverage = getCoverageFile();
            const baseSummary = baseCoverage && getCoverage_1.getSummary(baseCoverage);
            const branchSummary = branchCoverage && getCoverage_1.getSummary(branchCoverage);
            console.log('base', baseSummary);
            console.log('base', branchSummary);
            // compare coverage
            // comment coverage diff
            // commit new coverage
            core.setOutput('time', new Date().toTimeString());
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
