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

router.get('/searchFriendById', (req, res) => {

    console.log('/friend/searchFriendById');
    friendService.searchFriendById(req, res);

});

router.get('/matchingFriend', (req, res) => {

    console.log('/friend/matchingFriend');
    friendService.matchingFriend(req, res);

});

router.post('/requestFriend', (req, res) => {

    console.log('/friend/requestFriend');
    friendService.requestFriend(req, res);

});

router.get('/matchingRequestFriend', (req, res) => {

    console.log('/friend/matchingRequestFriend');
    friendService.matchingRequestFriend(req, res);

});

router.delete('/deleteRequestFriend', (req, res) => {

    console.log('/friend/deleteRequestFriend');
    friendService.deleteRequestFriend(req, res);

});


router.get('/getReceivedRequestFriend', (req, res) => {

    console.log('/friend/getReceivedRequestFriend');
    friendService.getReceivedRequestFriend(req, res);

});

router.put('/acceptRequestFriend', (req, res) => {

    console.log('/friend/acceptRequestFriend');
    friendService.acceptRequestFriend(req, res);

});

router.post('/acceptReqTargetFriend', (req, res) => {

    console.log('/friend/acceptReqTargetFriend');
    friendService.acceptReqTargetFriend(req, res);

});

router.get('/getSentRequestFriend', (req, res) => {

    console.log('/friend/getSentRequestFriend');
    friendService.getSentRequestFriend(req, res);

});

router.delete('/deletesentReqFriend', (req, res) => {

    console.log('/friend/deletesentReqFriend');
    friendService.deletesentReqFriend(req, res);

});

module.exports = router;