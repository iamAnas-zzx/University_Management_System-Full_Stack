const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const Branch = require('../models/branch');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const methodOverride = require('method-override');
const { route } = require('./admin');

//url - parsing
router.use(express.urlencoded({ extended: true }));
router.use(methodOverride('_method'));

//session middleware
const requireLogin = (req, res , next) => { 
    if(!req.session.teacher_id){
        req.flash('fail' , 'Sign In fisrt!');
        return res.redirect('/teacher/login');
    }
    next();
};


//teacher/login part - 
router.get('/login', (req, res) => {
    if(req.session.teacher_id){
        req.flash('logged', 'Already Loged In!');
        return res.redirect('/teacher/dashboard')
    }
    res.render('teacher/login', { messages: req.flash('fail') });
})

//teacher/dashboard-authentication part -

router.post('/dashboard', async (req, res) => {
    try {

        const { loginID, password } = req.body;

        if (!loginID || !password) {
            req.flash('fail', 'Please enter email and password correctly!');
            res.redirect('/teacher/login');
        }

        const teacher = await Teacher.findOne({ loginId: loginID });

        if (!teacher || teacher.password !== password) {
            req.flash('fail', 'Invalid credentials.');
            res.redirect('/teacher/login');
        }
        req.session.teacher_id = teacher._id;
        res.redirect('/teacher/dashboard');
    } catch (e) {
        console.log(e);
    }
})

router.get('/dashboard' , requireLogin ,  async (req,res) => {

    const id = req.session.teacher_id;
    const teacher = await Teacher.findById(id).populate('branch');
    res.render('teacher/dashboard' , {messages : req.flash('logged')  , teacher});
})



//teacher/update part - 
router.get('/update', requireLogin , async (req, res) => {

    const id = req.session.teacher_id;
    const teacher = await Teacher.findById(id);
    const subjects = teacher.subject;
    const subject = req.query.subject;
    const rollNumber = req.query.rollNumber;
    let editData = false;
    const students = await Student.find({'Subjects.subjectName' : subject});
    if(subject && rollNumber){
        editData  = true;
        const student  = await Student.findOne({'rollNumber': rollNumber });
        let marks;
        for(let sub of student.Subjects){
            if(sub.subjectName === subject){
                marks = sub.Marks;
            }
        }
        return res.render('teacher/update' , { teacher , subjects , editData , students , subject , student , marks});
    }
    if(subject){
        
        return res.render('teacher/update' , { teacher , subjects , editData , students , subject});
    }
    res.render('teacher/update', { teacher , subjects , editData , students});
})

router.put('/update', requireLogin , async (req, res) => {
    const roll = req.body.hiddenRollNumber;
    const subject = req.body.hiddenSubject;
    const student = await Student.findOne({'rollNumber' : roll});
    for(let sub of student.Subjects ){
        if(sub.subjectName === subject){
            sub.Marks = req.body.marks;
        }
    }
    await student.save(); 
    res.redirect('/teacher/update')
});



//teacher//password part -
router.get('/password', requireLogin , async (req, res) => {
    res.render('teacher/password' , { messages : req.flash('validate')});
})

router.post('/password', requireLogin , async (req,res)=>{
    try {
        const id = req.session.teacher_id;
        const teacher = await Teacher.findById(id);
        const currPass = req.body.currPass; 
        const newPass = req.body.newPass;
        const newPassAgain = req.body.newPassAgain;
        if(!newPass || !currPass || !newPassAgain){
            req.flash('validate' , 'Please fill passwords correctly.');
            return res.redirect('/teacher/password');
        }
        if(newPass !== newPassAgain){
            req.flash('validate' , 'New passwords do not match!');
            return res.redirect('/teacher/password');
        }
        if(currPass !== teacher.password){
            req.flash('validate' , 'Cuurrent passwords is invalid!');
            return res.redirect('/teacher/password');
        }
        teacher.password = newPass;
        await teacher.save();
        req.flash('validate', 'Password change succesfully')        
        res.redirect('/teacher/password');
    } catch (error) {
        console.log(error);
    }
})

//logout part -
router.get('/logout' , requireLogin , async(req ,res) => { 
    req.session.teacher_id = null;
    res.redirect('/teacher/login');
})
module.exports = router;