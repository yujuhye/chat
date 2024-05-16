const express = require('express');
const adminService = require('../lib/service/adminService');
const { passport } = require('../lib/passport/passportJwt');
const router = express.Router();
const verifyJWT = require('../lib/passport/customVerify');

router.get('/', (req, res) => {
    console.log('/');
    adminService.admin(req, res);

});

router.get('/getAdmin', (req, res) => {
    console.log('/getAdmin');
    adminService.getAdmin(req, res);

});

router.post('/adminSignUpConfirm', (req, res) => {
    console.log('/adminSignUpConfirm');
    adminService.adminSignUpConfirm(req, res);

});

router.post('/newsWriteConfirm', verifyJWT, (req, res) => {
    console.log('/newsWriteConfirm');
    adminService.newsWriteConfirm(req, res);

});

router.get('/getNews', (req, res) => {
    console.log('/getNews');
    adminService.getNews(req, res);

});

router.get('/UserStatus', (req, res) => {
    console.log('/UserStatus');
    adminService.UserStatus(req, res);

});

router.get('/getNewsContent', (req, res) => {
    console.log('/getNewsContent');
    adminService.getNewsContent(req, res);

});

module.exports = router;