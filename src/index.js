#!/usr/bin/env node

'use strict';

/**
 * This wrapper executable checks for known node flags and appends them when found, before invoking the "real" _mocha(1) executable.
 *
 * @module bin/mocha
 * @private
 */
const LIB = './libs';
const TASK = './list';

const parser = require(LIB + '/parser');
const loadTasksTags = parser.loadTasksTags;

//parser.test_path = TASK;

loadTasksTags();