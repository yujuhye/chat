const DB = require('../db/db');
const fs = require('fs');

const chatRoomService = {

    list: (req, res) => {
        res.render('list');
    }

}

module.exports = chatRoomService;