const express = require('express');
const chatRoomService = require('../lib/service/chatRoomService');
const router = express.Router();

router.get('/', (req, res) => {

    console.log('/');
    chatRoomService.list(req, res);

});

module.exports = router;