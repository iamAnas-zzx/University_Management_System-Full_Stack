const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Branch = require('./branch')
const teacherDetails = new Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: [String],
        required: true
    },
    branch: {
        type : Schema.Types.ObjectId,
        ref : 'Branch',
    },
    loginId : { 
        type : String,
        required: true
    },
    password : {
        type : String,
        required: true
    }
});

const Teacher = mongoose.model('Teacher', teacherDetails);

module.exports = Teacher;
