const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportConfig = require('./passport');

const indexRouter = require('./routes/index');
// const users = require('./routes/user/index');
// const board = require('./routes/board/index'); 

const db = require('./models');
const app = express();

db.sequelize.sync(); // config에 설정한 DB에 컬럼들을 생성해준다.
passportConfig(passport);

app.set('port', process.env.PORT || 8001); //사용자가 입력해준 포트가 없으면 8001포트를 사용한다.

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('wooseong'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'wooseong',
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));
app.use(flash()); //일회성 메시지를 사용할때 사용한다.
app.use(passport.initialize());
app.use(passport.session()); //express세션보다 항상 아래있어야한다. 왜냐하면 express 세션을 사용하기 때문이다.

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
// app.use('/users', users);
// app.use('/board',board);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err,status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log("🚀 ~ file: app.js ~ line 54 ~ app.use ~ err", err)
    res.locals.message = err.message;
    res.locals.error = req.app.get('env' === 'development' ? err : {});
    res.status(err.status || 500);
    res.json('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '포트가 실행중입니다.');
})