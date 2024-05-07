const express = require('express');
const memberService = require('../lib/service/memberService');
const router = express.Router();
const uploads = require('../lib/upload/uploads');

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

module.exports = router;