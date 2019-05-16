const fs = require('fs');
const assert = require('chai').assert;
const support = require('./functions/support');

const
    ROOT_PATH = '../',
    SELF_PATH = './',
    SRC_PATH = ROOT_PATH + 'src/',
    LIB_PATH = SRC_PATH + 'libs/',
    TASK_PATH = ROOT_PATH + 'list/',
    TEST_PATH = SELF_PATH + 'test/',
    FAKE_PATH = TEST_PATH + 'fake/',
    EMPTY_PATH = FAKE_PATH + 'empty/';

const RIGHTS_FILE = FAKE_PATH + 'access_root.test';

const checkIt = support.checkIt,
    parser = require(LIB_PATH + 'parser'),
    loadTasksTags = parser.loadTasksTags,
    findTestFilesInDir = parser.test.findTestFilesInDir,
    parseFileForTags = parser.test.parseFileForTags,
    findDirectivesInChunk = parser.test.findDirectivesInChunk,
    saveFileTags = parser.test.saveFileTags,
    generateTestsFromTags = parser.test.generateTestsFromTags;

// Creates new empty folder for test parsing
if (!fs.existsSync(EMPTY_PATH)) {
    fs.mkdir(EMPTY_PATH, (err) => {
        if (err) throw err;
    });
}

// Creates new file with no access from users
if (!fs.existsSync(RIGHTS_FILE)) {
    fs.open(RIGHTS_FILE, 'a', 0o000, (err, fd) => {
        if (err) throw err;
        fs.close(fd);
    });
}

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
        {params: [' @TASK @TAG javascript @AREA programming @LEVEL 1 @LANG en @QUESTION How much is the fish?  @ANSWER [rand] - 100$ - 50$ + 20$ -1$  @END  ', 100]
            , returns: {task: [101], tag: [107], question: [159], answer: [192], end: [231], area: [123], lang:[150], level:[141]}},
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
        {params: [function() {}, FAKE_PATH], returns: undefined},
    ]
};

parser.buff_length = 50;
let parseFileForTags_testing = {
    fn: parseFileForTags,
    assert: 'equal',
    list: [
        {params: [FAKE_PATH + '1.test'], returns: undefined},
    ]
};

parser.test_path = FAKE_PATH;
let loadTasksTags_testing = {
    fn: loadTasksTags,
    assert: 'equal',
    list: [
        //{params: [], returns: undefined},
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

describe("Function saveFileTags:", function() {
    let test_object = {},
        first_chunk = {tags: [12]},
        second_chunk = {tags: [123]},
        second_result = {tags: [12, 123]},
        task;

    task = '(' + 1 + ') ' + 'CHECK: saveFileTags'
        + '\n\t' + 'RETURNS: '
        + JSON.stringify(second_result);

    it(task, function() {
        saveFileTags(test_object, first_chunk);
        assert.deepEqual(test_object, first_chunk);
        saveFileTags(test_object, second_chunk);
        assert.deepEqual(test_object, second_result);
    });

    task = '(' + 2 + ') ' + 'CHECK: saveFileTags' + '({})'
        + '\n\t' + 'RETURNS: (ERROR) '
        + 'parser.saveFileTags: not object given in second parameter';

    it(task, function() {
        assert.throw(
            () => saveFileTags({}),
            /parser.saveFileTags: not object given in second parameter/
        )
    });

    task = '(' + 3 + ') ' + 'CHECK: saveFileTags' + '(null, {})'
        + '\n\t' + 'RETURNS: (ERROR) '
        + 'parser.saveFileTags: not object given in first parameter';

    it(task, function() {
        assert.throw(
            () => saveFileTags(null,{}),
            /parser.saveFileTags: not object given in first parameter/
        )
    });
});