const express = require('express');
const homeService = require('../lib/service/homeService');
const router = express.Router();

router.get('/', (req, res) => {

    console.log('/');
    homeService.home(req, res);

});

module.exports = router;