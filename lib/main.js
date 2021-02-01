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
const github = __importStar(require("@actions/github"));
const util_1 = require("util");
const child_process_1 = __importDefault(require("child_process"));
const getCoverage_1 = require("./getCoverage");
const fs_1 = __importDefault(require("fs"));
const markdown_table_1 = __importDefault(require("markdown-table"));
const exec = util_1.promisify(child_process_1.default.exec);
const getCoverageFile = () => {
    try {
        return JSON.parse(fs_1.default.readFileSync('./coverage-compare/coverage-summary.json', 'utf8'));
    }
    catch (e) {
        console.log('no coverage file found on base branch');
        return undefined;
    }
};
const getSymbol = (val) => (val > 0 ? '📈' : val < 0 ? '📉' : '');
exports.generateTable = (base, compare) => {
    return markdown_table_1.default([
        ['', 'old', 'new', 'diff'],
        ...Object.keys(base).map(key => [
            key,
            `${base[key]}%`,
            `${compare[key]}%`,
            `${(compare[key] - base[key]).toFixed(2)}% ${getSymbol(compare[key] - base[key])}`
        ])
    ]);
};
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get current
            const compareCoverage = getCoverageFile();
            //make temp copy
            // fs.copyFileSync(
            //   './coverage-compare/coverage-summary.json',
            //   './coverage-compare/tmp-coverage-summary.json'
            // )
            //get base
            yield exec(`git checkout -f ${process.env.GITHUB_BASE_REF} `);
            const baseCoverage = getCoverageFile();
            yield exec(`git checkout -f ${process.env.GITHUB_HEAD_REF}`);
            const githubToken = core.getInput('githubToken', { required: true });
            if (baseCoverage) {
                const table = exports.generateTable(getCoverage_1.getSummary(baseCoverage), getCoverage_1.getSummary(compareCoverage));
                // 4. comment on PR with coverage diff
                const octokit = new github.GitHub(githubToken);
                const context = github.context;
                const pullRequest = context.payload.pull_request;
                if (pullRequest == null) {
                    core.setFailed('No pull request found.');
                    return;
                }
                const pull_request_number = pullRequest.number;
                yield octokit.issues.createComment(Object.assign(Object.assign({}, context.repo), { issue_number: pull_request_number, body: table }));
            }
            if (compareCoverage) {
                // fs.copyFileSync(
                //   './coverage-compare/tmp-coverage-summary.json',
                //   './coverage-compare/coverage-summary.json'
                // )
                //   const remote = `https://${process.env.GITHUB_ACTOR}:${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git`
                //   await exec('git config http.sslVerify false')
                //   await exec('git config --local user.name "Coverage"')
                //   await exec('git config --local user.email "coverage@bot.com"')
                //   await exec('git add ./coverage-compare/coverage-summary.json')
                //   await exec('git commit -m "Updating code coverage summary"')
                //   await exec(`git push "${remote}" HEAD:"${process.env.GITHUB_HEAD_REF}"`)
                // }
            }
            core.setOutput('time', new Date().toTimeString());
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
