const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Branch = require('./branch');
const Teacher = require('./teacher');
const Student = require('./student');

const adminDetails = new Schema({
    University : {
        type : String,
        required : true
    },
    Teachers : [
        {type : mongoose.Schema.Types.ObjectId,
        ref : 'Teacher'
    }],
    Student : [
        {type : mongoose.Schema.Types.ObjectId,
        ref : 'Student'
    }],
    Faculty : [
        {type : mongoose.Schema.Types.ObjectId,
        ref : 'Branch'
    }],
    loginId : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
})



const Admin = mongoose.model('Admin' , adminDetails);

//Creating a firstAdmin 
//Comment out after creating
// const a = new Admin({ University : 'Madan Mohan Malaviya' , loginId : 'MadanMohanAdmin' , password : '112233' });
// a.save();

module.exports = Admin;