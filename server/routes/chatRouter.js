const express = require('express');
const chatService = require('../lib/service/chatService');
const router = express.Router();

router.get('/chatView', (req, res) => {

    console.log('/chat/chatView');
    chatService.chatView(req, res);

});

module.exports = router;