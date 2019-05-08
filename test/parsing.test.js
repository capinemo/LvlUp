const assert = require('chai').assert;
const support = require('./support');

const checkIt = support.checkIt;


const LIB = '../src/libs';
const TASK = '../list';

const parser = require(LIB + '/parser');

//parser.test_path = TASK;
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

describe("Function findDirectivesInChunk:", function() {
    findDirectivesInChunk_testing.list.forEach(function(item, index) {
        checkIt(item, index, findDirectivesInChunk_testing.fn, findDirectivesInChunk_testing.assert)
    });
});