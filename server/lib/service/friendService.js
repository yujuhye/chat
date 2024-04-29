const DB = require('../db/db');
const fs = require('fs');

const friendService = {

    friend: (req, res) => {
        res.render('friend');
    }

}

module.exports = friendService;