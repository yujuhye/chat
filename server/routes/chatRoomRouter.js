const express = require('express');
const chatRoomService = require('../lib/service/chatRoomService');
const router = express.Router();

// 리스트, 방이름 수정, 방 나가기, 메시지, 메시지 내용
// chat room list
router.get('/list', (req, res) => {

    console.log('/chatRoom/list');
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

module.exports = router;