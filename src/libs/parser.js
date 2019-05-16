const fs = require('fs');
const path = require('path');
const ER_M = '\x1b[31m',
    SC_M = '\x1b[32m',
    WR_M = '\x1b[33m',
    ST_M = '\x1b[0m';
const directives = ['task', 'tag', 'question', 'answer', 'end', 'area', 'level', 'lang'];

exports.test_path = './list/';
exports.tag_list = {};
exports.buff_length = 2048;
exports.echo_mode = 'work'; // work | test
exports.list = {}; // work | test

const logIt = {
    blank: function (type, head, mess) {
        if (exports.echo_mode === 'work') {
            console.log(type + head + ST_M + ': ' + mess);
        }
    },
    error: function (head, mess) {
        this.blank(ER_M, head, mess)
    },
    success: function (head, mess) {
        this.blank(SC_M, head, mess)
    },
    warn: function (head, mess) {
        this.blank(WR_M, head, mess)
    }
};

const clearStr = function (str) {
    return str.length < 12 ? str : (' ' + str).slice(1);
};

/**
 * Recursively finds *.test files in directory and applies callback function to every file
 *
 * @param   callback Function     Function calls for every found item
 * @param   path string           Change default path of tests storage
 * @returns void                  Nothing
 */
function findTestFilesInDir (callback, path = exports.test_path) {
    if (typeof callback !== 'function') {
        throw new Error('parser.findTestFilesInDir: not function given in callback');
    }

    if (!fs.existsSync(path)) {
        throw new Error('parser.findTestFilesInDir: given path not exists');
    }

    fs.readdir(path, {withFileTypes : true}, (err, files) => {
        if (err) {
            return console.log(ER_M + err + ST_M);
        }

        if (!files.length) {
            return;
        }

        files.forEach(function (i) {
            let full_path = path + i.name;

            if (i.isDirectory()) {
                fs.access(full_path, fs.constants.R_OK | fs.constants.X_OK, (err) => {
                    return (err)
                        ? logIt.error('DENIED', full_path)
                        : findTestFilesInDir(callback,full_path + '/');
                });
            } else if (i.isFile() && /\.test$/.test(i.name)) {
                fs.access(full_path, fs.constants.R_OK, (err) => {
                    if (err) {
                        logIt.error('DENIED', full_path);
                        return;
                    }

                    callback(full_path);
                    logIt.success('LOADED', full_path);
                });
            } else {
                logIt.warn('IGNORED', full_path);
            }
        });
    })
}

/**
 * Reads chunks from file, finds @-directives in chunk and saves its to accumulation object.
 * After file ending calls tests generation function
 *
 * @param $file
 */
function parseFileForTags ($file) {
    let chunk_num = 0,
        offset = 0,
        stream = fs.createReadStream($file, {encoding: 'utf8', highWaterMark: exports.buff_length}),
        buffer = '',
        tags = {};

    stream.on('end', () => {
        stream.destroy();
        generateTestsFromTags(tags);
    });

    stream.on('data', (chunk) => {
        let total_offset = chunk_num * exports.buff_length,
            chunk_with_buffer = (buffer)
                ? buffer + chunk
                : chunk,
            result = findDirectivesInChunk(chunk_with_buffer, offset);

        logIt.success('CHUNK', '#' + chunk_num);

        chunk_num++;

        if (result._hunch && result._hunch.length > 0) {
            offset = result._hunch[result._hunch.length - 1];
            buffer = clearStr(chunk.substr(offset - total_offset));
        } else {
            offset = total_offset;
            buffer = '';
        }

        saveFileTags(tags, result);

        chunk_with_buffer = null;
        chunk = null;
    });
}

/**
 * Accumulates @-directives from second object in first object
 *
 * @param   file_tags Object        List of all file directives
 * @param   chunk_tags Object       List of directives in the chunk
 */
function saveFileTags(file_tags, chunk_tags) {
    if (!file_tags || Object.prototype.toString.call({file_tags}) !== '[object Object]') {
        throw new Error('parser.saveFileTags: not object given in first parameter');
    }

    if (!chunk_tags || Object.prototype.toString.call({chunk_tags}) !== '[object Object]') {
        throw new Error('parser.saveFileTags: not object given in second parameter');
    }

    for (let key in chunk_tags) {
        if (chunk_tags.hasOwnProperty(key) && key !== '_hunch') {
            if (!file_tags[key] || !Array.isArray(file_tags[key])) {
                file_tags[key] = [];
            }

            file_tags[key] = file_tags[key].concat(chunk_tags[key]);
        }
    }
}

function generateTestsFromTags (file_tags) {

}

/**
 * Searching @-directives in the given string. Returns list of the directives with its position in the string
 *
 * @param   str string            String for searching directives
 * @param   offset integer        Chunk position offset
 */
function findDirectivesInChunk (str = '', offset = 0) {
    //console.log(str);
    const markers = {};

    let substr_list = {substr_10: null, substr_8: null, substr_6: null, substr_5: null, substr_4: null, substr_3: null},
        margin = 0,
        mark;

    if (typeof str !== 'string') {
        throw new Error('parser.findDirectivesInChunk: not string given in first argument')
    }

    while( ~(mark = str.indexOf('@', margin)) ) {
        //console.log(mark);
        let directive_found= false;

        substr_list.substr_10 = str.substr(mark+1, 10).toLowerCase();
        substr_list.substr_8 = substr_list.substr_10.substr(0, 8);
        substr_list.substr_6 = substr_list.substr_8.substr(0, 6);
        substr_list.substr_5 = substr_list.substr_6.substr(0, 5);
        substr_list.substr_4 = substr_list.substr_5.substr(0, 4);
        substr_list.substr_3 = substr_list.substr_4.substr(0, 3);

        for (let i = directives.length; i--; ) {
            let item = directives[i];

            if (item !== substr_list['substr_' + item.length]) {
                continue;
            }

            if (!markers[item]) {
                markers[item] = [];
            }

            markers[item].push(mark + offset);
            directive_found = true;
            break;
        }

        if (!directive_found) {
            if (!markers._hunch) {
                markers._hunch = [];
            }

            markers._hunch.push(mark  + offset);
        }

        margin = mark + 1;
    }

    substr_list = null;

    return markers;
}

exports.loadTasksTags = function () {
    findTestFilesInDir((file) => {
        parseFileForTags(file);
    });
};

exports.test = {
    findTestFilesInDir: findTestFilesInDir,
    parseFileForTags: parseFileForTags,
    findDirectivesInChunk: findDirectivesInChunk,
    saveFileTags: saveFileTags,
    generateTestsFromTags: generateTestsFromTags
};
