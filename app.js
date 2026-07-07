if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const helmet = require('helmet');
const { MongoStore } = require('connect-mongo');
const dbUrl = process.env.DB_URL;

// localhost MongoDB mongodb://localhost:27017/yelp-camp

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

let dbConnectionPromise = null;
const connectDB = () => {
    if (mongoose.connection.readyState >= 1) return Promise.resolve();
    if (!dbConnectionPromise) dbConnectionPromise = mongoose.connect(dbUrl);
    return dbConnectionPromise;
};

mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => console.log("Database connected"));

const app = express();
app.set('trust proxy', 1);
app.set('query parser', 'extended');

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => { connectDB().then(() => next()).catch(next); });

app.use(sanitizeV5({ replaceWith: '_' }));

const secret = process.env.SESSION_SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: { secret }
});


const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    res.render('home')
});

// Do not adjust this to app.all('*')
app.get(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})
 
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log('Serving on port 3000')
    })
}

module.exports = app;