/**
 * Created by sangmin on 6/20/15.
 */
'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    owner: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    shared: [{
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    folder: {
        name: String,
        alias: String
    }
});

mongoose.model('Account', schema);