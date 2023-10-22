const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const Branch = require('../models/branch');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const methodOverride = require('method-override');

//url - parsing
router.use(express.urlencoded({ extended: true }));
router.use(methodOverride('_method'));

//session middleware
const requireLoginAdmin = (req, res , next) => { 
    if(!req.session.admin_id){
        req.flash('fail' , 'Sign In fisrt!');
        return res.redirect('/admin/login');
    }
    next();
};


//Login Portion I have to do it in seperate
router.get('/login', (req, res) => {
    res.render('admin/login' ,  { messages: req.flash('fail') });
})

//admin/dashboard part -

router.post('/dashboard', async (req, res) => {
    try {

        const { loginID, password } = req.body;

        if (!loginID || !password) {
            req.flash('fail', 'Please enter email and password correctly!');
            return res.redirect('/admin/login');
        }

        const admin = await Admin.findOne({ loginId: loginID });

        if (!admin || admin.password !== password) {
            req.flash('fail', 'Invalid credentials.');
            return res.redirect('/admin/login');
        }
        req.session.admin_id = admin._id;
        res.redirect('/admin/dashboard');
    } catch (e) {
        console.log(e);
    }
})


router.get('/dashboard', requireLoginAdmin ,async (req, res) => {
    const data = await Admin.findOne({ University: "Madan Mohan Malaviya" }).populate('Faculty', 'name');
    res.render('admin/dashboard', { data });
})


//admin/branch part -
router.get('/branch', requireLoginAdmin, async (req, res) => {

    const branchList = await Branch.find({});
    const showEditBox = false;

    res.render('admin/branch', { branchList,  showEditBox });
})


router.get('/branch/:id', requireLoginAdmin, async (req, res) => {
    const { id } = req.params;
    const showEditBox = true;
    const branchList = await Branch.find({});
    const branch = await Branch.findById(id);
    const subjectsList = branch.Subjects;
    res.render('admin/branch', { branchList, subjectsList, branch, showEditBox });
})

router.put('/branch/:id', requireLoginAdmin ,async (req, res) => {
    try {
        const { id } = req.params;
        const newBranchName = req.body.name;
        const branch = await Branch.findById(id);
        //storing previous subjects name
        const oldSubjectNames = branch.Subjects; 
        //updating branch name 
        branch.name = newBranchName;
        //storing new subjects name
        const newSubjectNames = req.body.subjectName;
        //creating pair arrays 
        const subjectNamePairs = [];
        // Check if the lengths of old and new subject names match
        if (oldSubjectNames.length === newSubjectNames.length) {
            for (let i = 0; i < oldSubjectNames.length; i++) {
                const pair = {
                    oldName: oldSubjectNames[i],
                    newName: newSubjectNames[i],
                };
                subjectNamePairs.push(pair);
            }
            // Now, subjectNamePairs contains the pairs of old and new subject names

        }
        //updating subject names in beanch BD
        console.log(branch.Subjects);
        for(let i = 0 ; i < branch.Subjects.length ; i++){
            branch.Subjects[i] = subjectNamePairs[i].newName;
        }
        
        //updating subject names in student DB
        const studentData = await Student.find({ branch : branch._id });
        studentData.forEach(async (student) =>{
            for(let i = 0 ; i < student.Subjects.length ; i++){
                student.Subjects[i].subjectName = subjectNamePairs[i].newName;
            }
            await student.save();
        })

        //updating subject names in teacher DB
        const teacherData  = await Teacher.find({branch : branch._id});
        
        teacherData.forEach( async (teacher) => {
            teacher.subject.forEach((subjects , index) => {
                subjectNamePairs.forEach((pair) => {
                    if (subjects === pair.oldName) {
                        // Update the subject name
                        teacher.subject[index] = pair.newName;
                    }
                });
            });
            await teacher.save();
        });
        
        await branch.save();

        res.redirect('/admin/branch');
    } catch (e) {
        console.log(e);
    }
})


router.post('/branch', requireLoginAdmin ,async (req, res) => {
    try {
        const subjectNames = req.body.hiddenSubjects.split(',').map(subjectName => subjectName.trim());

        const subjectArray = subjectNames;
        const newBranch = new Branch({
            name: req.body.name,
            Subjects: subjectNames
        });
        console.log(newBranch);
        await newBranch.save();

        const Uni = await Admin.findOne({ University : 'Madan Mohan Malaviya'});
        Uni.Faculty.push(newBranch._id);
        await Uni.save();
        console.log(Uni);
        res.redirect('/admin/branch');
    }
    catch (e) {
        console.log(e);
    }

})

router.delete('/branch/:id' , requireLoginAdmin , async ( req,res) => {
    try{
        const { id } = req.params;
        
        const branch = await Branch.findById(id);
        const studentIDS = await Student.find({branch : id});
        const teacherIDS = await Teacher.find({branch : id});
        console.log(studentIDS);
        console.log(teacherIDS);
        for(let s of studentIDS){
            await Student.findByIdAndDelete(s._id);
        }
        for(let t of teacherIDS){
            await Student.findByIdAndDelete(t._id);
        }
        await Branch.findByIdAndDelete(id);
        res.redirect('/admin/branch');
    }catch(e){
        console.log(e);
    }
})


//admin/teachers part -
router.get('/teachers', requireLoginAdmin , async (req, res) => {
    try {
        const branchList = await Branch.find({});
        res.render('admin/teachers', { branchList });
    } catch (e) {
        console.log(e);
    }
})
router.get('/teachers-data', requireLoginAdmin , async (req, res) => {
    try {
        const branchList = await Branch.find({});
        const branch = req.query.branch;
        const branchDetails = await Branch.findOne({ name: branch });
        const theTeachersData = await Teacher.find({ branch: branchDetails._id });
        res.render('admin/teachers-data', { branchList, branchDetails, theTeachersData });
    } catch (e) {
        console.log(e);
    }

})

router.get('/teachers-edit/:id', requireLoginAdmin ,  async (req, res) => {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    const branchID = teacher.branch;
    const branchList = await Branch.find({});
    const branchDetails = await Branch.findById(branchID);
    const theTeachersData = await Teacher.find({ branch: branchDetails._id });

    res.render('admin/teachers-edit', { branchList, branchDetails, theTeachersData , teacher});
})


router.post('/teachers-data', requireLoginAdmin , async (req, res) => {
    try {

        const branch = req.body.hiddenBranch;
        const branchDetails = await Branch.findOne({ name: branch });

        const newTeacher = new Teacher({
            name: req.body.name,
            subject: req.body.subject,
            branch: branchDetails._id,
            loginId: req.body.loginId,
            password: req.body.password
        })
        await newTeacher.save();

        // Save the updated branch document
        branchDetails.teacher.push(newTeacher._id);
        await branchDetails.save();
        const Uni = await Admin.findOne({ University: "Madan Mohan Malaviya" });
        Uni.Teachers.push(newTeacher._id);
        await Uni.save();
        res.redirect('/admin/teachers');
    } catch (e) {
        console.log(e);
    }
})

router.put('/teachers-edit/:id' , requireLoginAdmin , async (req,res) =>{
    try{
        const {id} = req.params;
        const teacher =await Teacher.findById(id);
        teacher.name = req.body.name;
        teacher.loginId = req.body.loginId;
        teacher.password = req.body.password;
        teacher.subject = req.body.subject;
        console.log(teacher);
        await teacher.save();
        res.redirect('/admin/teachers');
    }catch(e){
        console.log(e);
    }
})

router.delete('/teachers/:id' , requireLoginAdmin , async ( req,res) => { 
    const {id} = req.params;
    await Teacher.findByIdAndDelete(id);
    res.redirect('/admin/teachers');
})


//admin/student part -
router.get('/students', requireLoginAdmin ,  async (req, res) => {
    try {
        const branchList = await Branch.find({});
        const branch = req.query.branch;
        let showData = false;
        if (branch) {
            showData = true;
            const branchData = await Branch.findOne({ name: branch });
            const studentData = await Student.find({ branch: branchData._id });
            res.render('admin/students', { branchList, branch, studentData, showData});
        } else {
            res.render('admin/students', { branchList, showData });
        }
    } catch (e) {
        console.log(e);
    }
})

router.get('/students-edit/:id', requireLoginAdmin , async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        const branchid = student.branch;
        const branch = await Branch.findById(branchid);
        const branchList = await Branch.find({});
        const studentData = await Student.find({branch : branchid});

        res.render('admin/students-edit', { branchList, branch , studentData , student });

    } catch (e) {
        console.log(e);
    }
})



router.post('/students', requireLoginAdmin ,async (req, res) => {

    const branch = req.body.branch;
    const branches = await Branch.findOne({ name: branch });
    const subjectNames = branches.Subjects.map(subject => ({
        subjectName: subject,
        Marks: 0
    }));

    const newStudent = new Student({
        name: req.body.name,
        Subjects: subjectNames,
        branch: branches._id,
        rollNumber: req.body.rollNumber,
        address: req.body.address,
        loginId: req.body.loginId,
        password: req.body.password

    });
    //Saving new student data
    await newStudent.save();

    //updating branch
    branches.student.push(newStudent._id);
    await branches.save();

    //updating admin
    const Uni = await Admin.findOne({University : 'Madan Mohan Malaviya'});
    Uni.Student.push(newStudent._id);
    await Uni.save();
    console.log(Uni);

    res.redirect('/admin/students');
})

router.put('/students-edit/:id' , requireLoginAdmin , async (req,res) =>{
    try{
        const { id } = req.params;
        const student = await Student.findById(id);
        const branchid = student.branch;
        const subjectNames = student.Subjects;
       
        //Now updating
        student.name = req.body.name,
        student.Subjects = subjectNames,
        student.branch = branchid,
        student.rollNumber = req.body.rollNumber,
        student.address = req.body.address,
        student.loginId = req.body.loginId,
        student.password = req.body.password
        await student.save();

        res.redirect('/admin/students');
    }catch(e){
        console.log(e);
    }
        
})

router.delete('/students/:id' , requireLoginAdmin , async ( req,res) => { 
    const {id} = req.params;
    await Student.findByIdAndDelete(id);
    res.redirect('/admin/students');
})


//admin/password part - 
router.get('/password', requireLoginAdmin , (req, res) => {
    res.render('admin/password' , { messages: req.flash('validate') });
})

router.post('/password', requireLoginAdmin , async (req,res)=>{
    try {
        const id = req.session.admin_id;
        const admin = await Admin.findById(id);
        const currPass = req.body.currPass; 
        const newPass = req.body.newPass;
        const newPassAgain = req.body.newPassAgain;
        if(!newPass || !currPass || !newPassAgain){
            req.flash('validate' , 'Please fill passwords correctly.');
            return res.redirect('/admin/password');
        }
        if(newPass !== newPassAgain){
            req.flash('validate' , 'New passwords do not match!');
            return res.redirect('/admin/password');
        }
        if(currPass !== admin.password){
            req.flash('validate' , 'Cuurrent passwords is invalid!');
            return res.redirect('/admin/password');
        }
        admin.password = newPass;
        await admin.save();
        req.flash('validate', 'Password change succesfully')        
        res.redirect('/admin/password');
    } catch (error) {
        console.log(error);
    }
})

//logout part -
router.get('/logout', requireLoginAdmin , (req,res) => {
    req.session.admin_id = null;
    res.redirect('/admin/login');
} )

module.exports = router;