const express = require('express');
const chatService = require('../lib/service/chatService');
const router = express.Router();

router.get('/', (req, res) => {

    console.log('/');
    chatService.chat(req, res);

});

module.exports = router;