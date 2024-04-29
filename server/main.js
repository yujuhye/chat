const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const session = require('express-session');
const { MemoryStore } = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');

// socket.io 설정 -> 되는지 확인 필요
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('./socket/socket')(io);

app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({

    origin: 'http://localhost:3000',
    credentials: true,

}));

// session start
const maxAge = 60 * 60 * 30;
const sessionObj = {

    secret: 'chat!', // session password
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({checkPeriod: maxAge}),
    cookie: {
        maxAge: maxAge,
    },

}

app.use(session(sessionObj));

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