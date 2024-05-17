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

router.get('/getNewsContent', (req, res) => {
    console.log('/getNewsContent');
    adminService.getNewsContent(req, res);

});

router.get('/userStatus', (req, res) => {
    console.log('/userStatus');
    adminService.userStatus(req, res);

});

router.get('/chatStatusThreeHourly', (req, res) => {
    console.log('/chatStatusThreeHourly');
    adminService.chatStatusThreeHourly(req, res);

});

router.get('/chatStatusDaily', (req, res) => {
    console.log('/chatStatusDaily');
    adminService.chatStatusDaily(req, res);

});

router.get('/chatStatusWeekly', (req, res) => {
    console.log('/chatStatusWeekly');
    adminService.chatStatusWeekly(req, res);

});



module.exports = router;