const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const session = require('express-session');
const { MemoryStore } = require('express-session');
const bcrypt = require('bcrypt');

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
    
    console.log('/chat');
    res.send('chat');

});


app.listen(3001);