const express = require('express');
const chatService = require('../lib/service/chatService');
const router = express.Router();

router.get('/details/:roomId', (req, res) => {
    console.log('/chat/details');
    chatService.details(req, res);
});

module.exports = router;