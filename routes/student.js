const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const Branch = require('../models/branch');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const methodOverride = require('method-override');
const { route } = require('./admin');
const { render } = require('ejs');

//url - parsing
router.use(express.urlencoded({ extended: true }));
router.use(methodOverride('_method'));

//session middleware
const requireLoginStudent = (req, res , next) => { 
    if(!req.session.student_id){
        req.flash('fail' , 'Sign In fisrt!');
        return res.redirect('/student/login');
    }
    next();
};

router.get('/login', (req,res)=>{
    if(req.session.student_id){
        req.flash('logged', 'Already Loged In!');
        return res.redirect('/student/dashboard')
    }
    res.render('student/login', { messages : req.flash('fail') });
})

router.post('/dashboard', async (req,res)=>{
    try {

        const { loginID, password } = req.body;

        if (!loginID || !password) {
            console.log('in');
            req.flash('fail', 'Please enter email and password correctly!');
            return res.redirect('/student/login');
        }

        const student = await Student.findOne({ loginId: loginID });
        if (!student || student.password !== password) {
            req.flash('fail', 'Invalid credentials.');
            return res.redirect('/student/login');
        }
        req.session.student_id = student._id;
        res.redirect('/student/dashboard');
    } catch (e) {
        console.log(e);
    }
})

router.get('/dashboard', requireLoginStudent ,  async (req,res)=>{
    try{
        const id = req.session.student_id;
        const student = await Student.findById(id).populate('branch');
        res.render('student/dashboard' , {messages : req.flash('logged')  , student});
    }catch(e){
        console.log(e);
    }
})

router.get('/course', requireLoginStudent ,  async (req,res)=>{
    try{
        const id = req.session.student_id;
        const student = await Student.findById(id).populate('branch');
        res.render('student/course' ,  { student});
    }catch(e){
        console.log(e);
    }
})

router.get('/result',  requireLoginStudent , async (req,res)=>{
    try{
        const id = req.session.student_id;
        const student = await Student.findById(id);
        
        res.render('student/result' , { student});
    }catch(e){
        console.log(e);
    }
})


router.get('/password', requireLoginStudent , async(req,res)=>{ 
    res.render('student/password' , { messages : req.flash('validate')});
});

router.post('/password', requireLoginStudent , async (req,res)=>{
    try {
        const id = req.session.student_id;
        const student = await Student.findById(id);
        const currPass = req.body.currPass; 
        const newPass = req.body.newPass;
        const newPassAgain = req.body.newPassAgain;
        if(!newPass || !currPass || !newPassAgain){
            req.flash('validate' , 'Please fill passwords correctly.');
            return res.redirect('/student/password');
        }
        if(newPass !== newPassAgain){
            req.flash('validate' , 'New passwords do not match!');
            return res.redirect('/student/password');
        }
        if(currPass !== student.password){
            req.flash('validate' , 'Cuurrent passwords is invalid!');
            return res.redirect('/student/password');
        }
        student.password = newPass;
        await student.save();
        req.flash('validate', 'Password change succesfully')        
        res.redirect('/student/password');
    } catch (error) {
        console.log(error);
    }
})


router.get('/logout' , async(req ,res) => { 
    req.session.student_id = null;
    res.redirect('/student/login');
})
module.exports = router;