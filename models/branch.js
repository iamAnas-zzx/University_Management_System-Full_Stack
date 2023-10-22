const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const branchDetails = new Schema({
    name: {
        type: String,
        required: true
    },
    Subjects: {
        type: [String],
        required: true
    },
    teacher: [{
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
    }],
    student: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }]

})

const Branch = mongoose.model('Branch', branchDetails);

module.exports = Branch;