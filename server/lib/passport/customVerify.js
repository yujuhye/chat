const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

const secretKey = '1234';

function verifyJWT(req, res, next) {

    const token = req.headers.authorization;
    console.log('token ---> ', token);

    if (!token) {
        return res.status(401).json({ error: '로그인되지 않았습니다.' });
    }

    try {
        const payload = jwt.verify(token.split(' ')[1], secretKey);

        if (payload) {
            console.log('토큰이 유효합니다.');
            console.log('페이로드:', payload);
            next();

        } else {
            console.log('유효하지 않은 토큰입니다.');
            res.status(401).send();
        }
    } catch (error) {
        console.error('에러 발생:', error);
        res.status(500).json({ error: '서버 에러' });

    }
}

module.exports = verifyJWT;