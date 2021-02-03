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
const fs_1 = __importDefault(require("fs"));
const markdown_table_1 = __importDefault(require("markdown-table"));
const aws_sdk_1 = require("aws-sdk");
const getCoverage_1 = require("./getCoverage");
const s3 = new aws_sdk_1.S3();
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
const uploadFile = (branch, filePath) => {
    const readStream = fs_1.default.createReadStream(filePath);
    return new Promise((resolve, reject) => {
        s3.upload({
            Bucket: 'cko-prism-frontend',
            Key: `checks/${branch}/coverage-summary.json`,
            Body: readStream
        }, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
};
const download = (branch) => {
    return new Promise((resolve, reject) => {
        s3.getObject({
            Bucket: 'cko-prism-frontend',
            Key: `checks/${branch}/coverage-summary.json`
        }, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                if (data.Body) {
                    resolve(JSON.parse(data.Body.toString()));
                }
            }
        });
    });
};
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get current
            const compareCoverage = getCoverageFile();
            //get base (from S3)
            const baseCoverage = yield download(process.env.GITHUB_BASE_REF).catch(err => console.log(err));
            if (baseCoverage) {
                const table = exports.generateTable(getCoverage_1.getSummary(baseCoverage), getCoverage_1.getSummary(compareCoverage));
                const githubToken = core.getInput('githubToken', { required: true });
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
            else {
                console.log('no base coverage found');
            }
            yield uploadFile(process.env.GITHUB_HEAD_REF, 'coverage-compare/coverage-summary.json');
            core.setOutput('time', new Date().toTimeString());
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
