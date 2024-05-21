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

router.get('/chatStatusMonthly', (req, res) => {
    console.log('/chatStatusMonthly');
    adminService.chatStatusMonthly(req, res);

});

router.get('/chatStatusWeekly/:month', (req, res) => {
    console.log('/chatStatusWeekly/:month');
    adminService.chatStatusWeekly(req, res);

});

router.get('/chatStatusDaily/:week', (req, res) => {
    console.log('/chatStatusDaily/:week');
    adminService.chatStatusDaily(req, res);

});



module.exports = router;