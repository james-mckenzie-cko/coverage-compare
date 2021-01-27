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
const getCoverageFile = () => {
    let coverage;
    try {
        coverage = require('./coverage-compare/coverage-summary.json');
        console.log('🚀 ~ file: main.ts ~ line 12 ~ getCoverageFile ~ coverage', coverage);
    }
    catch (_a) {
        console.log(`no coverage found for branch`);
    }
    return coverage;
};
const getCurrentBranch = () => __awaiter(void 0, void 0, void 0, function* () { return (yield exec(`git rev-parse --abbrev-ref HEAD`)).stdout; });
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1. on branch to compare
            // 2. get existing coverage summary
            // 	- get base branch name
            console.log('GITHUB_BASE_REF', process.env.GITHUB_BASE_REF);
            // 	- checkout base branch
            // await exec(`git checkout -f ${process.env.GITHUB_BASE_REF}`)
            // 	- get coverage summary
            const baseCoverage = getCoverageFile();
            // 3. get current coverage summary
            // 	- checkout compare branch
            // await exec(`git checkout -f ${process.env.GITHUB_HEAD_REF}`)
            // 	- run tests with coverage
            // const {stdout} = await exec(
            //   `yarn test --coverage --coverageReporters="json-summary" coverageDirectory="coverage-compare"`
            // )
            // console.log('🚀 ~ file: main.ts ~ line 46 ~ run ~ stdout', stdout)
            // 	- get coverage summary
            const compareCoverage = getCoverageFile();
            console.log('🚀 ~ file: main.ts ~ line 52 ~ run ~ compareCoverage', compareCoverage);
            console.log('🚀 ~ file: main.ts ~ line 37 ~ run ~ baseCoverage', baseCoverage);
            // 4. comment on PR with coverage diff
            // 5. commit new coverage summary
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
