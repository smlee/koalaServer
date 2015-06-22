/**
 * Created by sang on 6/21/15.
 */
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
    file: {
        name: String,
        file_type: {
            type: String
        },
        status: {
            type: String
        },
        created_at: {
            type: Date,
            default: Date.now()
        },
        modified_at: {
            type: Date,
            default: Date.now()
        }
    },
    child: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }
});

mongoose.model('File', schema);