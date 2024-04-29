const DB = require('../db/db');
const fs = require('fs');

const chatService = {

    chat: (req, res) => {
        res.render('chat');
    }

}

module.exports = chatService;