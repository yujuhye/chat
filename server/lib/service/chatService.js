const DB = require('../db/db');
const fs = require('fs');

const chatService = {

    chatView: (req, res) => {
        res.render('chat');
    }

}

module.exports = chatService;