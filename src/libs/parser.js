const fs = require('fs');
const path = require('path');

exports.test_path = './list';
exports.tag_list = {};
exports.buff_length = 111;

/**
 * Recursively finds *.test files in directory and applies callback function to every file
 *
 * @param callback Function     Function calls for every found item
 * @param path string           Change default path of tests storage
 * @returns void                Nothing
 */
function findTestFilesInDir (callback, path = exports.test_path) {
    // TODO check rights and log it

    if (!fs.existsSync(path)) {
        return console.log('\x1b[31m' + 'Directory of tests list is not exists. Run ' + '\x1b[7m'
            + 'lvlup --help' + '\x1b[0m\x1b[31m' + ' for mor information.' + '\x1b[0m');
    }

    fs.readdir(path, {withFileTypes : true}, (err, files) => {
        if (err) {
            return console.log('\x1b[31m' + err + '\x1b[0m');
        }

        if (!files) {
            return console.log('\x1b[31' + 'Directory is empty' + '\x1b[0m');
        }

        files.forEach(function (i) {
            if (i.isDirectory()) {
                return findTestFilesInDir(callback,path + '/' + i.name);
            }

            if (i.isFile() && /\.test$/.test(i.name)) {
                callback(path + '/' + i.name);
                return console.log('\x1b[32m' + 'LOADED' + '\x1b[0m: ' + path + '/' + i.name);
            }

            return console.log('\x1b[33m' + 'IGNORED' + '\x1b[0m: ' + path + '/' + i.name);
        });


    })
}

function parseFileForTags ($file) {
    let stream = fs.createReadStream($file, {encoding: 'utf8', highWaterMark: exports.buff_length}), //start, end
        chunks = [],
        count = 0,
        buffer;

    stream.once('error', (err) => {
        throw err;
    });

    stream.once('end', () => {
        //console.log('!!!', chunks.length, chunks instanceof Array)
        //buffer = Buffer.concat(chunks);
        //console.log(buffer.length);
        // Of course, you can do anything else you need to here, like emit an event!
    });

    stream.on('data', (chunk) => {
        let buffer = Buffer.from(chunk);

        console.log('START: ', count);
        console.log(findDirectivesInChunk(chunk, count * exports.buff_length));
        //console.log(buffer);

        //let view   = new Uint8Array(buffer);

        //console.log(buffer.toString('utf8'));
        //console.log(view.buffer.toString('utf8'));
        //chunks.push(chunk); // push data chunk to array
        //console.log(chunk.length, chunks.length);
        //console.log(chunk);

        //console.log('END: ', count);
        count++;
    });
}

function findDirectivesInChunk (str, offset = 0) {
    const directives = ['task', 'tag', 'question', 'answer', 'end'],
        markers = {};

    let substr_list = {substr_10: null, substr_8: null, substr_6: null, substr_5: null, substr_4: null, substr_3: null},
        margin = 0,
        mark;

    while( ~(mark = str.indexOf('@', margin)) ) {
        let directive_found= false;

        substr_list.substr_10 = str.substr(mark+1, 10).toLowerCase();
        substr_list.substr_8 = substr_list.substr_10.substr(0, 8);
        substr_list.substr_6 = substr_list.substr_8.substr(0, 6);
        substr_list.substr_5 = substr_list.substr_6.substr(0, 5);
        substr_list.substr_4 = substr_list.substr_5.substr(0, 4);
        substr_list.substr_3 = substr_list.substr_4.substr(0, 3);

        for (let i = directives.length; i--; ) {
            let item = directives[i],
                len = item.length;

            if (item !== substr_list['substr_' + len]) {
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
