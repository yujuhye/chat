const express = require('express');
const memberService = require('../lib/service/memberService');
const router = express.Router();

router.get('/', (req, res) => {

    console.log('/');
    memberService.member(req, res);

});

module.exports = router;