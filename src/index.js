#!/usr/bin/env node

'use strict';

const LIB = './libs';
const TASK = './list';

const parser = require(LIB + '/parser');
const loadTasksTags = parser.loadTasksTags;

//parser.test_path = TASK;

loadTasksTags();