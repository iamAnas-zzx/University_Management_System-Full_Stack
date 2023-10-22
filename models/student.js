const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const studentDetails = new Schema({
    name: {
        type: String,
        required: true
    },
    Subjects: [{
        subjectName : {
            type : String,
            required : true
        },
        Marks : {
            type : Number,
            default : 0
        }
    }],
    branch: {
        type : Schema.Types.ObjectId,
        ref : 'Branch',
    },
    rollNumber : {
        type : Number,
        required : true
    },
    address : {
        type: String,
        required : true
    },
    loginId : { 
        type : String,
        required: true
    },
    password : {
        type : String,
        required: true
    }
})

const Student = mongoose.model('Student', studentDetails);

module.exports = Student;
