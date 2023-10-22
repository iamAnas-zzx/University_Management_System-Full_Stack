//The basic drill
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const flash = require('connect-flash');
// const passport = require('passport');
const method_override = require('method-override');

//this is used for middleware part and still no use here
// const morgan = require('morgan');



//Error handling part
//const ExpressError = require('./utils/ExpressError');
//const methodOverride = require('method-override');

//express-routers
const aadminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');

//mongoDB models
const Admin = require('./models/admin');
const Branch = require('./models/branch');
const Student = require('./models/student');
const Teacher = require('./models/teacher');

//setting up static files
app.use(express.static(path.join(__dirname, 'public')))

//setting of views part
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

//flash-session- cookie
app.use(cookieParser('secret'));
app.use(session({
    secret: 'notagoodsecret',
    // cookie: {maxAge : 6000},
    saveUninitialized: true,
    resave: true
}));
app.use(flash());



//mongoDB connection
// mongoose.connect('mongodb://localhost:27017/UMS', {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });
mongoose.connect('mongodb://localhost:27017/UMS', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })


//routers-middleware
app.use('/admin', aadminRoutes);
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);

//url-parsing
app.use(express.urlencoded({ extended: true }));
app.use(method_override('_method'));


app.get('/', (req, res) => {
    res.render('home');
})



app.delete('/admin/branch', async (req, res) => {

})

app.all('*', (req, res) => {
    // next(new ExpressError('Page Not Found', 404))
    res.send("Page Not Found");
})

// app.use((err, req, res, next) => {
//     const { statusCode = 500 } = err;
//     if (!err.message) err.message = 'Oh No, Something Went Wrong!'
//     res.status(statusCode).render('error', { err })
// })

app.listen(3000, () => {
    console.log('Server is listening at port 3000!')
})