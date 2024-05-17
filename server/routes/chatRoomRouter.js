const express = require('express');
const chatRoomService = require('../lib/service/chatRoomService');
const router = express.Router();
const verifyJWT = require('../lib/passport/customVerify');

// 리스트, 방이름 수정, 방 나가기, 메시지, 메시지 내용
// chat room list
router.get('/list', (req, res) => {
    const userId = req.cookies['userToken'];

    console.log('/chatRoom/list');
    console.log('/chatRoom/list -----> ', userId);
    chatRoomService.list(req, res);

});

// 친구 리스트 가져오기
router.get('/getFriendList', (req, res) => {

    console.log('/chatRoom/getFriendList');
    chatRoomService.getFriendList(req, res);

});

// chat room title modify confirm
router.post('/modifyTitleConfirm', (req, res) => {

    console.log('/chatRoom/modifyTitleConfirm');
    chatRoomService.modifyTitleConfirm(req, res);

});

// chat room delete confirm
router.get('/deleteChatRoom', (req, res) => {

    console.log('/chatRoom/deleteChatRoom');
    chatRoomService.deleteChatRoom(req, res);

});

// getUserInfo
router.get('/getUserInfo', (req, res) => {

    console.log('/chatRoom/getUserInfo');
    chatRoomService.getUserInfo(req, res);

});

// 채팅방 검색하기
router.get('/searChatRoom', (req, res) => {

    console.log('/chatRoom/searChatRoom');
    chatRoomService.searChatRoom(req, res);

});

module.exports = router;