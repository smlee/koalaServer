/**
 * Created by sang on 6/21/15.
 */
'use strict';

var router = require('express').Router();
module.exports = router;

var path = require('path');
let _ = require('lodash');
let Promise = require('bluebird');
let fs = Promise.promisifyAll(require('fs'));
let mime = require('mime-types');
let rimraf = Promise.promisifyAll(require('rimraf'));
let mkdirp = Promise.promisifyAll(require('mkdirp'));





//router.get('/', function(req, res){
//    console.log('hello???');
//    res.send(200, 'this is a test');
//});

router.get('/', setFileMeta, sendHeaders, (req, res) => {
    console.log('hello???');
    if (res.body) {
        res.json(res.body)
        return
    }
    fs.createReadStream(req.filePath).pipe(res)
});

//router.head('/', setFileMeta, sendHeaders, (req, res) => res.end());
//
//router.delete('/', setFileMeta, (req, res, next) => {
//
//    if (!req.stat) return res.send(400, 'Invalid Path')
//    if (req.stat.isDirectory()) {
//            rimraf(req.filePath).then(()=>{
//                res.end();
//            }).catch(next);
//    } else {
//        fs.unlink(req.filePath).then(()=> {
//            res.end();
//        }).catch(next);
//    }
//
//});
//
//router.post('/', setFileMeta, setDirDetails, (req, res, next) => {
//    if (req.stat) return res.send(405, 'File exists')
//    mkdirp(req.dirPath).then(()=>{
//        res.end();
//    }).catch(next);
//
//    if (!req.isDir) {
//        req.pipe(fs.createWriteStream(req.filePath))
//    }
//});
//
//router.put('/', setFileMeta, setDirDetails, (req, res, next) => {
//
//    if (!req.stat) return res.send(405, 'File does not exist')
//    if (req.isDir || req.stat.isDirectory()) return res.send(405, 'Path is a directory')
//
//    fs.truncate(req.filePath, 0).then(()=>{
//        res.end()
//    }).catch(next)
//    req.pipe(fs.createWriteStream(req.filePath))
//
//});


function nodeify(promise, cb, options) {
    if (typeof cb !== 'function') return promise
    return promise.then(function (ret) {
        if (options && options.spread && Array.isArray(ret)) {
            cb.apply(null, [null].concat(ret))
        } else cb(null, ret)
    }, cb)
}
nodeify.Promise = Promise;

function setDirDetails(req, res, next) {
    let filePath = req.filePath
    let endsWithSlash = filePath.charAt(filePath.length-1) === path.sep
    let hasExt = path.extname(filePath) !== ''
    req.isDir = endsWithSlash || !hasExt
    req.dirPath = req.isDir ? filePath : path.dirname(filePath)
    next()
}

function setFileMeta(req, res, next) {
    req.filePath = path.resolve(path.join(__dirname, req.url))
    if (req.filePath.indexOf(__dirname) !== 0) {
        res.send(400, 'Invalid path');
        return
    }
    fs.statAsync(req.filePath)
      .then(stat => req.stat = stat, ()=> req.stat = null)
.nodeify(next)
}

function sendHeaders(req, res, next) {
    console.log('this is req.stat',req.stat);
    if (req.stat.isDirectory()) {
        fs.readdirAsync(req.filePath).then((files) =>{
            res.body = JSON.stringify(files);
            res.setHeader('Content-Length', res.body.length);
            res.setHeader('Content-Type', 'application/json');
            next();
        }).catch(next)
    }else {
        res.setHeader('Content-Length', req.stat.size)
        let contentType = mime.contentType(path.extname(req.filePath))
        res.setHeader('Content-Type', contentType)
        next();
    }
}