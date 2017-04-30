'use strict';

var through = require('through2');
var path = require('path');
var File = require('vinyl');
var Beautify = require('js-beautify');


// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function(filename, opt) {
  opt = opt || {};

  // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
  if (typeof opt.newLine !== 'string') {
    opt.newLine = '\n';
  }

  var _tplObj = {};
  var _contents;
  var handleReg;
  var versionReg = /v(\d)/
  var _version;
  process.version.replace(versionReg,function(m0,m1){
    _version = m1;
  });
  //console.log('process.platform',process.platform);
  if(opt.src){
    handleReg = new RegExp(opt.src+'(.*)(\.html|\.js|\.css)');
  }else{
    handleReg = /templates(.*)(\.html|\.js|\.css)/;
  }


  var jsString2Amd = function(string){
    var head = "define(function(){ var tpl=\n";
    var foot = ";return tpl;});";
    return head + string + foot;
  };

  function objStates(obj,arr,string,index){
    //console.log('obj',obj);
    //console.log('arr',arr);
    //console.log('index',index);
    if(typeof index !== 'number'){
        index = 0;
    }
    if(arr[index] && typeof arr[index] === 'string'){
        if(typeof obj[arr[index]] !== 'object'){
            obj[arr[index]] = {};
        }
    }
    if(arr[index+1]){
        objStates(obj[arr[index]],arr,string,index+1);
    }else{
        obj[arr[index]] = string;
    }
  }

  var arrHandle = function(path){
    var usingPath;
    path.replace(handleReg,function(m0,m1,m2){
        usingPath = m1;
        return m1;
    });
    var classArr = [];
    if(usingPath.substring(0,1) === '\\' || usingPath.substring(0,1) === '\/' ){
        usingPath=usingPath.slice(1);
    }

    if(usingPath){
        if(usingPath.indexOf('\\') > -1){
            classArr = usingPath.split('\\');
        }else{
            classArr = usingPath.split('\/');
        }

    }else{
        classArr=[];
    }
    //console.log('arrHandle',classArr);
    return classArr;
  };




  function bufferContents(file, enc, cb) {
    // ignore empty files
    if (file.isNull()) {
      cb();
      return;
    }

    // we don't do streams (yet)
    if (file.isStream()) {
      this.emit('error', new Error('gulp-html2tpljs: Streaming not supported'));
      cb();
      return;
    }
    var path = file.path;
    var classArr = arrHandle(path);
    var htmlContents = file.contents.toString('utf8');
    var data = htmlContents;
    objStates(_tplObj,classArr,data);
    cb();
  }

  function endStream(cb) {
    //console.log('_tplObj',_tplObj);
    var joinedFile = new File(filename);
    if(typeof filename === 'string'){
        joinedFile.path = path.join(filename);
    } else {
        joinedFile.path = path.join('tpl.js');
    }
    var stringEnd = Beautify(jsString2Amd(JSON.stringify(_tplObj)));
    if(_version >=6){
        joinedFile.contents = Buffer.from(stringEnd);
    }else{
        joinedFile.contents = new Buffer(stringEnd);
    }
    console.log('_version',_version);
    this.push(joinedFile);
  }

  return through.obj(bufferContents, endStream);
};

