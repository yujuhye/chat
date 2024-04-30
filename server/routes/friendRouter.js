const express = require('express');
const friendService = require('../lib/service/friendService');
const router = express.Router();

router.get('/friendList', (req, res) => {

    console.log('/friend/friendList');
    friendService.friendList(req, res);

});

router.get('/myProfile', (req, res) => {

    console.log('/friend/myProfile');
    friendService.myProfile(req, res);

});

module.exports = router;