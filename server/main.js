const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const bcrypt = require('bcrypt');
const cors = require('cors');
const http = require('http').createServer(app);
const cookieParser = require('cookie-parser');

// Express에 CORS 미들웨어 적용
app.use(cors({
    origin: "http://localhost:3000", // 프론트엔드 서버 주소
    credentials: true // 쿠키를 포함시키기 위해 필요
}));

// Socket.IO 설정
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000", // 프론트엔드 서버 주소
        methods: ["GET", "POST"], // 허용할 HTTP 메소드
        credentials: true
    }
});

// Socket.IO 설정을 위한 socket.js 모듈 호출
require('./socket/socket')(io);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // 문제가 있을 시 확인 후 수정해야할듯
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(`C:\\member\\upload\\profile_thums\\`));  //img 주해추가

const maxAge = 60 * 60 * 1000 * 30; // 쿠키 최대 유효 시간 설정(예: 30시간)
const sessionObj = {
    secret: 'chat!',
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: maxAge
    }),
    cookie: {
        maxAge: maxAge,
    },
}

app.use(session(sessionObj));

app.use(cookieParser());

// passport START  -- 경선 추가

//// USER

let pp = require('./lib/passport/passport');
let passport = pp.passport(app);

app.get('/member/signinConfirm', passport.authenticate('local', {
    successRedirect: '/signinSuccess',
    failureRedirect: '/signinFail',

}));

// 로그인 성공 시
app.get('/signinSuccess', (req, res) => {
    console.log('signinSuccess ::: req.user --> ', req.user);
    res.cookie('sessionID', req.sessionID, { maxAge: 1000 * 60 * 30 });
    res.json({
        'sessionID': req.sessionID,
        'uId': req.user,
    });

});

// 로그인 실패 시
app.get('/signinFail', (req, res) => {
    console.log('signinFail');

    res.json(null);

});

//// ADMIN
let ppa = require('./lib/passport/passportforadmin');
let passportforadmin = ppa.passport(app);

app.get('/admin/adminSigninConfirm', passportforadmin.authenticate('local', {
    successRedirect: '/adminSigninSuccess',
    failureRedirect: '/adminSigninFail',

}));

// 로그인 성공 시
app.get('/adminSigninSuccess', (req, res) => {
    console.log('signinSuccess ::: req.user --> ', req.user);
    res.cookie('adminSessionID', req.sessionID, { maxAge: 1000 * 60 * 30 });
    res.json({
        'adminSessionID': req.sessionID,
        'aId': req.user,
    });

});

// 로그인 실패 시
app.get('/adminSigninFail', (req, res) => {
    console.log('signinFail');

    res.json(null);

});

// passport END


app.get('/', (req, res) => {
    console.log('/');
    res.redirect('/home');
});

// 라우터 설정
const homeRouter = require('./routes/homeRouter');
app.use('/home', homeRouter);

const chatRoomRouter = require('./routes/chatRoomRouter');
app.use('/chatRoom', chatRoomRouter);

const chatRouter = require('./routes/chatRouter');
app.use('/chat', chatRouter);

const friendRouter = require('./routes/friendRouter');
app.use('/friend', friendRouter);

const memberRouter = require('./routes/memberRouter');
app.use('/member', memberRouter);

const adminRouter = require('./routes/adminRouter');
app.use('/admin', adminRouter);

// Express 서버 대신 http 서버를 사용하여 시작, Socket.IO와 함께 사용
http.listen(3001, () => {
    console.log('listening on *:3001');
});