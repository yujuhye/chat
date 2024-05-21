const express = require('express');
const friendService = require('../lib/service/friendService');
const uploads = require('../lib/upload/uploads');
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

router.get('/blockFriend', (req, res) => {

    console.log('/friend/blockFriend');
    friendService.blockFriend(req, res);

});

router.put('/releaseBlockFriend', (req, res) => {

    console.log('/friend/releaseBlockFriend');
    friendService.releaseBlockFriend(req, res);

});

router.put('/hideRequestFriend', (req, res) => {

    console.log('/friend/hideRequestFriend');
    friendService.hideRequestFriend(req, res);

});

router.get('/matchingReceivedReqFriend', (req, res) => {

    console.log('/friend/matchingReceivedReqFriend');
    friendService.matchingReceivedReqFriend(req, res);

});

router.put('/myProfileEdit', uploads.UPLOAD_MULTIPROFILE_MIDDLEWARE(), (req, res) => {

    console.log('/friend/myProfileEdit');
    friendService.myProfileEdit(req, res);

});

router.put('/myBackDefaultImg', (req, res) => {

    console.log('/friend/myBackDefaultImg');
    friendService.myBackDefaultImg(req, res);

});

router.put('/myBackDefaultImg', (req, res) => {

    console.log('/friend/myBackDefaultImg');
    friendService.myBackDefaultImg(req, res);

});

router.put('/myFrontDefaultImg', (req, res) => {

    console.log('/friend/myFrontDefaultImg');
    friendService.myFrontDefaultImg(req, res);

});

router.put('/updateblockFriend', (req, res) => {

    console.log('/friend/updateblockFriend');
    friendService.updateblockFriend(req, res);

});

router.delete('/deleteFriend', (req, res) => {

    console.log('/friend/deleteFriend');
    friendService.deleteFriend(req, res);

});

router.delete('/deleteTargetFriend', (req, res) => {

    console.log('/friend/deleteTargetFriend');
    friendService.deleteTargetFriend(req, res);

});

router.get('/matchHidenFriend', (req, res) => {

    console.log('/friend/matchHidenFriend');
    friendService.matchHidenFriend(req, res);

});

router.get('/getHiddenFriends', (req, res) => {

    console.log('/friend/getHiddenFriends');
    friendService.getHiddenFriends(req, res);

});

router.put('/releaseHiddenFriend', (req, res) => {

    console.log('/friend/releaseHiddenFriend');
    friendService.releaseHiddenFriend(req, res);

});

router.put('/addFavorite', (req, res) => {

    console.log('/friend/addFavorite');
    friendService.addFavorite(req, res);

});

router.put('/deleteFavorite', (req, res) => {

    console.log('/friend/deleteFavorite');
    friendService.deleteFavorite(req, res);

});

router.get('/getMyProfileImgs', (req, res) => {

    console.log('/friend/getMyProfileImgs');
    friendService.getMyProfileImgs(req, res);

});

router.get('/getMyBackImgs', (req, res) => {

    console.log('/friend/getMyBackImgs');
    friendService.getMyBackImgs(req, res);

});

router.get('/getFriendProfileImgs', (req, res) => {

    console.log('/friend/getFriendProfileImgs');
    friendService.getFriendProfileImgs(req, res);

});

router.get('/getFriendBackImgs', (req, res) => {

    console.log('/friend/getFriendBackImgs');
    friendService.getFriendBackImgs(req, res);

});

router.get('/getSavednotification', (req, res) => {

    console.log('/friend/getSavednotification');
    friendService.getSavednotification(req, res);

});

router.put('/updateNotificationRead', (req, res) => {

    console.log('/friend/updateNotificationRead');
    friendService.updateNotificationRead(req, res);

});

module.exports = router;