/**
 * Created by sangmin on 6/20/15.
 */
'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    user: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder'
    }
});

mongoose.model('Account', schema);