const
    ROOT_PATH = '../',
    SELF_PATH = './',
    SRC_PATH = ROOT_PATH + 'src/',
    LIB_PATH = SRC_PATH + 'libs/',
    TASK_PATH = ROOT_PATH + 'list/',
    TEST_PATH = SELF_PATH + 'test/',
    JOBS_PATH = TEST_PATH + 'jobs/',
    EMPTY_PATH = JOBS_PATH + 'empty/';


const fs = require('fs');
// Creates new empty folder for testing
if (!fs.existsSync(EMPTY_PATH)) {
    fs.mkdir(EMPTY_PATH, (err) => {
        if (err) throw err;
    });
};

const assert = require('chai').assert;

const support = require('./functions/support');
const checkIt = support.checkIt;

const parser = require(LIB_PATH + 'parser');
const loadTasksTags = parser.loadTasksTags;
const findTestFilesInDir = parser.test.findTestFilesInDir;
const parseFileForTags = parser.test.parseFileForTags;
const findDirectivesInChunk = parser.test.findDirectivesInChunk;

let findDirectivesInChunk_testing = {
    fn: findDirectivesInChunk,
    assert: 'deepStrictEqual',
    list: [
        {params: [], returns: {}},
        {params: [''], returns: {}},
        {params: ['Test string without directives'], returns: {}},
        {params: ['Test string with directive @TASK'], returns: {task: [27]}},
        {params: ['Test string with directive @TAG'], returns: {tag: [27]}},
        {params: ['Test string with directive @QUEST'], returns: {_hunch: [27]}},
        {params: ['Test string with not compete directive @QUEST with offset', 100], returns: {_hunch: [139]}},
        {params: [' @TASK  @TAG design patterns | php  @QUESTION How much is the fish?  @ANSWER [rand] - 100$ - 50$ + 20$ -1$  @END  ', 100]
            , returns: {task: [101], tag: [108], question: [136], answer: [169], end: [208], }},
        {params: [Date], returns: /parser.findDirectivesInChunk: not string given in first argument/, assert: 'throws'},
    ]
};

let findTestFilesInDir_testing = {
    fn: findTestFilesInDir,
    assert: 'equal',
    list: [
        {params: [], returns: /parser.findTestFilesInDir: not function given in callback/, assert: 'throws'},
        {params: [function() {}], returns: undefined},
        {params: [function() {}, './qwe'], returns: /parser.findTestFilesInDir: given path not exists/, assert: 'throws'},
        {params: [function() {}, JOBS_PATH], returns: undefined},
    ]
};

let parseFileForTags_testing = {
    fn: parseFileForTags,
    assert: 'equal',
    list: [
        {params: [JOBS_PATH + '1.test'], returns: undefined},
    ]
};

parser.test_path = JOBS_PATH;
let loadTasksTags_testing = {
    fn: loadTasksTags,
    assert: 'equal',
    list: [
        {params: [], returns: undefined},
    ]
};

parser.echo_mode = 'test';
describe("Function findDirectivesInChunk:", function() {
    findDirectivesInChunk_testing.list.forEach(function(item, index) {
        checkIt(item, index, findDirectivesInChunk_testing.fn, findDirectivesInChunk_testing.assert)
    });
});

describe("Function findTestFilesInDir:", function() {
    findTestFilesInDir_testing.list.forEach(function(item, index) {
        checkIt(item, index, findTestFilesInDir_testing.fn, findTestFilesInDir_testing.assert)
    });
});

describe("Function parseFileForTags:", function() {
    parseFileForTags_testing.list.forEach(function(item, index) {
        checkIt(item, index, parseFileForTags_testing.fn, parseFileForTags_testing.assert)
    });
});

describe("Function loadTasksTags:", function() {
    loadTasksTags_testing.list.forEach(function(item, index) {
        checkIt(item, index, loadTasksTags_testing.fn, loadTasksTags_testing.assert)
    });
});