const express = require('express');
const chatService = require('../lib/service/chatService');
const router = express.Router();
const uploads = require('../lib/upload/uploads');

router.get('/details/:roomId', (req, res) => {
    console.log('/chat/details');
    chatService.details(req, res);
});

router.get('/getJoinUser', (req, res) => {
    console.log('/chat/getJoinUser');
    chatService.getJoinUser(req, res);
});

// 채팅 내용 검색하기
router.get('/searChatText', (req, res) => {
    console.log('/chat/searChatText');
    chatService.searChatText(req, res);
});

// 파일 전송
router.post('/submitImgFiles', uploads.UPLOAD_CHAT_IMG_MIDDLEWARE(),(req, res) => {
    console.log('/chat/submitImgFiles');
    chatService.submitImgFiles(req, res);
});

router.post('/submitVideoFiles', uploads.UPLOAD_CHAT_VIDEO_MIDDLEWARE(), (req, res) => {
    console.log('/chat/submitVideoFiles');
    chatService.submitVideoFiles(req, res);
});

router.post('/submitFiles', uploads.UPLOAD_CHAT_FILE_MIDDLEWARE(), (req, res) => {
    console.log('/chat/submitFiles');
    chatService.submitFiles(req, res);
});

module.exports = router;