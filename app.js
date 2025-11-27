var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
var session = require('express-session')
var flash = require('express-flash')

//routes index
const indexRouter = require('./routes/index')

//routes auth
const authRouter = require('./routes/auth')

//routes manajer
const dashboardManajerRouter = require('./routes/manajer/dashboard')
const bukuManajerRouter = require('./routes/manajer/buku')
const majalahManajerRouter = require('./routes/manajer/majalah')
const koranManajerRouter = require('./routes/manajer/koran')
const manajerRouter = require('./routes/manajer/manajer')

//routes pustakawan
const dashboardPustakawanRouter = require('./routes/pustakawan/dashboard')
const pustakawan = require('./routes/pustakawan/pustakawan')
const bukuRouter = require('./routes/pustakawan/buku/buku')
const majalahRouter = require('./routes/pustakawan/majalah/majalah')
const penerbitKoran = require('./routes/pustakawan/koran/penerbitKoran')
const koran = require('./routes/pustakawan/koran/koran')
const lantaiRouter = require('./routes/pustakawan/lokasi/lantai')
const ruanganRouter = require('./routes/pustakawan/lokasi/ruangan')
const rakRouter = require('./routes/pustakawan/lokasi/rak')
const bahasaRouter = require('./routes/pustakawan/data-induk/bahasa')
const kategoriRouter = require('./routes/pustakawan/data-induk/kategori')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//middleware untuk menyimpan data login
app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        secure: false, //ubah ke true jika sudah di hosting 
        maxAge: 600000000
    }
}))

//middleware untuk mengirim pesan
app.use(flash())

//routes index
app.use('/', indexRouter)

//routes auth
app.use('/', authRouter)

//routes manajer
app.use('/manajer/dashboard', dashboardManajerRouter)
app.use('/manajer/buku', bukuManajerRouter)
app.use('/manajer/majalah', majalahManajerRouter)
app.use('/manajer/koran', koranManajerRouter)
app.use('/manajer', manajerRouter)


//folder pustakawan
app.use('/pustakawan/dashboard', dashboardPustakawanRouter)
app.use('/pustakawan/', pustakawan)
app.use('/pustakawan/buku', bukuRouter)
app.use('/pustakawan/majalah', majalahRouter)
app.use('/pustakawan/penerbit-koran', penerbitKoran)
app.use('/pustakawan/koran', koran)
app.use('/pustakawan/lantai', lantaiRouter)
app.use('/pustakawan/ruangan', ruanganRouter)
app.use('/pustakawan/rak', rakRouter)
app.use('/pustakawan/bahasa', bahasaRouter)
app.use('/pustakawan/kategori', kategoriRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
// https://github.com/AqilYogaPramono