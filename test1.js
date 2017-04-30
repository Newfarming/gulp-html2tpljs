'use strict';

var through = require('through2');
var path = require('path');
var File = require('vinyl');
var Beautify = require('js-beautify');


// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function() {
  function bufferContents(file, enc, cb) {
    this.push(file)
    cb();
  }


  return through.obj(bufferContents);
};

