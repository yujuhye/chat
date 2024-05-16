const express = require('express');
const memberService = require('../lib/service/memberService');
const router = express.Router();
const uploads = require('../lib/upload/uploads');
const verifyJWT = require('../lib/passport/customVerify');

router.get('/', (req, res) => {
    console.log('/');
    memberService.member(req, res);

});

router.get('/getMember', (req, res) => {
    console.log('/getMember');
    memberService.getMember(req, res);

});

router.post('/signUpConfirm', uploads.UPLOAD_PROFILE_MIDDLEWARE(), (req, res) => {
    console.log('/signUpconfirm');
    memberService.signUpConfirm(req, res);

});

router.post('/modifyConfirm', verifyJWT, (req, res) => {
    console.log('/modifyConfirm');
    memberService.modifyConfirm(req, res);

});

router.put('/logoutConfirm', verifyJWT, (req, res) => {
    console.log('/logoutConfirm');
    memberService.logoutConfirm(req, res);

});

router.delete('/memberDeleteConfirm', verifyJWT, (req, res) => {
    console.log('/memberDeleteConfirm');
    memberService.memberDeleteConfirm(req, res);

});

router.post('/findPassword', (req, res) => {
    console.log('/findPassword');
    memberService.findPassword(req, res);

});

module.exports = router;