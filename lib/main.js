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
const exec = util_1.promisify(child_process_1.default.exec);
const getCoverageFile = (branch) => {
    let coverage;
    try {
        coverage = require('./coverage-compare/coverage-summary.json');
    }
    catch (_a) {
        console.log(`no coverage found for branch ` + branch);
    }
    return coverage;
};
const getCurrentBranch = () => __awaiter(void 0, void 0, void 0, function* () { return (yield exec(`git rev-parse --abbrev-ref HEAD`)).stdout; });
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentBranchName = yield getCurrentBranch();
            const baseBranchName = yield getCurrentBranch();
            console.log('currentBranchName, ', currentBranchName);
            console.log('baseBranchName', baseBranchName);
            console.log('GITHUB_BASE_REF', process.env.GITHUB_BASE_REF);
            // const baseCoverage = getCoverageFile(baseBranchName)
            // console.log('baseCoverage', baseCoverage)
            // await exec(`git checkout -f ${currentBranchName}`)
            // const branchCoverage = getCoverageFile(currentBranchName)
            // console.log('branchCoverage', branchCoverage)
            // const baseSummary = baseCoverage && getSummary(baseCoverage)
            // console.log('baseSummary', baseSummary)
            // const branchSummary = branchCoverage && getSummary(branchCoverage)
            // console.log('branchSummary', branchSummary)
            // console.log('base', baseSummary)
            // console.log('base', branchSummary)
            core.setOutput('time', new Date().toTimeString());
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
