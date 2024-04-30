const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const session = require('express-session');
const { MemoryStore } = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');

const os = require('os');

if (os.version().includes('Windows')) {
    host = '192.168.0.41';
} else {
    host = '192.168.0.41';
}

// socket.io 설정 -> 되는지 확인 필요
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('./socket/socket')(io);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('C:\\member\\upload\\profile_thums\\'));  // 프로필 사진 경선 추가

app.use(cors({

    origin: 'http://localhost:3000',
    credentials: true,

}));

// session start
const maxAge = 1000 * 60 * 30; // 세션 시간 경선 추가
const sessionObj = {

    secret: 'chat!', // session password
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({ checkPeriod: maxAge }),
    cookie: {
        maxAge: maxAge,
    },

}

app.use(session(sessionObj));

// passport START  -- 경선 추가
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
// passport END

app.get('/', (req, res) => {

    console.log('/');
    res.redirect('/home');

});

// router setting start

const homeRuter = require('./routes/homeRouter');
app.use('/home', homeRuter);

const chatRoomRouter = require('./routes/chatRoomRouter');
app.use('/chatRoom', chatRoomRouter);

const chatRouter = require('./routes/chatRouter');
app.use('/chat', chatRouter);

const friendRouter = require('./routes/friendRouter');
app.use('/friend', friendRouter);

const memberRouter = require('./routes/memberRouter');
app.use('/member', memberRouter);

// router setting end


app.listen(3001);