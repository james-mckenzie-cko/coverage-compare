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
const fs_1 = __importDefault(require("fs"));
const markdown_table_1 = __importDefault(require("markdown-table"));
const aws_sdk_1 = require("aws-sdk");
const s3 = new aws_sdk_1.S3();
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
            //get base (from S3)
            s3.listObjects({ Bucket: 'cko-prism-frontend' }, function (err, data) {
                if (err) {
                    console.log('Error', err);
                }
                else {
                    console.log('Success', data);
                }
            });
            // const baseCoverage = getCoverageFile()
            console.log(fs_1.default.readdirSync('./coverage-compare'));
            // const githubToken = core.getInput('githubToken', {required: true})
            // if (baseCoverage) {
            //   const table = generateTable(
            //     getSummary(baseCoverage),
            //     getSummary(compareCoverage)
            //   )
            //   const octokit = new github.GitHub(githubToken)
            //   const context = github.context
            //   const pullRequest = context.payload.pull_request
            //   if (pullRequest == null) {
            //     core.setFailed('No pull request found.')
            //     return
            //   }
            //   const pull_request_number = pullRequest.number
            //   await octokit.issues.createComment({
            //     ...context.repo,
            //     issue_number: pull_request_number,
            //     body: table
            //   })
            // }
            core.setOutput('time', new Date().toTimeString());
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
