const DB = require('../db/db');
const fs = require('fs');

const memberService = {

    member: (req, res) => {
        res.render('member');
    }

}

module.exports = memberService;