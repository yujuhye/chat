const express = require('express');
const friendService = require('../lib/service/friendService');
const router = express.Router();

router.get('/', (req, res) => {

    console.log('/');
    friendService.friend(req, res);

});

module.exports = router;