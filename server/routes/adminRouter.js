const express = require('express');
const adminService = require('../lib/service/adminService');
const router = express.Router();

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

module.exports = router;