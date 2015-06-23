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
let rimraf = Promise.promisify(require('rimraf'));
let mkdirp = Promise.promisify(require('mkdirp'));
var ensureAuthenticated = require('../auth');

console.log('cwd',process.cwd());
console.log('__dirname', __dirname);

router.get('/', setFileMeta, sendHeaders, (req, res) => {
    if (res.body) {
        res.json(res.body)
        return
    }
    fs.createReadStream(req.filePath).pipe(res)
});

router.head('/', setFileMeta, sendHeaders, (req, res) => res.end());

router.delete('/', ensureAuthenticated, setFileMeta, (req, res, next) => {

    if (!req.stat) return res.send(400, 'Invalid Path');
    if (req.stat.isDirectory()) {
            rimraf(req.filePath).then(()=>{
                res.end();
            }).catch(next);
    } else {
        fs.unlinkAsync(req.filePath).then(()=> {
            res.end();
        }).catch(next);
    }

});

router.post('/', ensureAuthenticated, setFileMeta, setDirDetails, (req, res, next) => {

    if (req.stat) return res.send(405, 'File exists');
        mkdirp(req.dirPath).then(()=>{
        res.end();
    }).catch(next);

    if (!req.isDir) {
        req.pipe(fs.createWriteStream(req.filePath))
    }
});

router.put('/', setFileMeta, setDirDetails, (req, res, next) => {

    if (!req.stat) return res.send(404, 'File does not exist');
    if (req.isDir || req.stat.isDirectory()) return res.send(405, 'Path is a directory');

    fs.truncateAsync(req.filePath, 0).then(()=>{
        res.end()
    }).catch(next);
    req.pipe(fs.createWriteStream(req.filePath))

});

function setDirDetails(req, res, next) {
    console.log(req.filePath);
    let filePath = req.filePath;
    let endsWithSlash = filePath.charAt(filePath.length-1) === path.sep;
    let hasExt = path.extname(filePath) !== '';
    req.isDir = endsWithSlash || !hasExt;
    req.dirPath = req.isDir ? filePath : path.dirname(filePath);
    next()
}

function setFileMeta(req, res, next) {
    console.log('req.url',req.url);
    console.log('req.query', req.query);
    var file = '';
    if(req.query.file){
        file = req.query.file
    }
    req.filePath = path.resolve(path.join(__dirname, file));
    if (req.filePath.indexOf(__dirname) !== 0) {
        res.status(400).send('Invalid path');
        return
    }
    fs.statAsync(req.filePath)
      .then(stat => req.stat = stat, ()=> req.stat = null)
      .then(()=>next());
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
        res.setHeader('Content-Length', req.stat.size);
        let contentType = mime.contentType(path.extname(req.filePath))
        res.setHeader('Content-Type', contentType);
        next();
    }
}