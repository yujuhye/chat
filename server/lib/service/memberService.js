const DB = require('../db/db');
const fs = require('fs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { emailAuth } = require('../config/findpasswordAuthInfo');

const memberService = {

    getMember: (req, res) => {
        let userToken = req.headers.authorization;
        if (!userToken) {
            userToken = req.cookies ? req.cookies['userToken'] : null;
        }

        if (userToken) {
            console.log('userToken --> ', userToken);
            console.log('The user session has not expired!!');

            const jwtOptions = {
                secretOrKey: '1234',
            };

            jwt.verify(userToken.split(' ')[1], jwtOptions.secretOrKey, (err, decoded) => {
                if (err) {
                    console.error('Error decoding JWT token:', err);
                    res.status(401).json({ error: 'Invalid token' });
                    return;
                }

                const uId = decoded.id;

                DB.query(
                    `SELECT * FROM USER_IFM WHERE USER_ID = ?`,
                    [uId],
                    (error, member) => {
                        if (error) {
                            res.json(null);
                        } else {
                            if (member.length > 0) {
                                res.json({
                                    'userToken': userToken,
                                    'member': member[0],
                                });
                            } else {
                                res.json(null);
                            }
                        }
                    }
                );
            });
        } else {
            console.log('The user session has expired or no token was found!!');
            res.status(401).json({ error: 'No user token provided or token expired' });
        }
    },

    signUpConfirm: (req, res) => {
        let post = req.body;

        let sql = `
            INSERT INTO USER_IFM(USER_ID, USER_PW, USER_EMAIL, USER_NICKNAME ${(req.file !== undefined) ? `, USER_FRONT_IMG_NAME` : ``})
            VALUES(?, ?, ?, ? ${(req.file !== undefined) ? `, ?` : ``})
        `
        let state = [post.uId, bcrypt.hashSync(post.uPw, 10), post.uEmail, post.uNickname];
        if (req.file !== undefined) state.push(req.file.filename);

        DB.query(sql, state, (error, result) => {
            console.log('result ---> ', result);
            if (error) {
                if (req.file !== undefined) {
                    fs.unlink(`C:\\member\\upload\\profile_thums\\${post.uId}\\${req.file.filename}`, (error) => {
                        console.log('UPLOADED FILE DELETE COMPLETED!!');
                    });
                }
                res.json(null);
            } else {
                DB.query(
                    `SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
                    [post.uId],
                    (error, rows) => {
                        if (rows.length >= 0) {
                            let USER_NO = rows[0].USER_NO;

                            console.log('USER_NO ---> ', USER_NO);
                            if (req.file !== undefined) {
                                DB.query(
                                    `INSERT INTO PROFILE_IMG(USER_NO, PROFILE_NAME, PROFILE_DIVIDE) 
                                    VALUES(?, ?, ?)`,
                                    [USER_NO, req.file.filename, 0],
                                    (error, result) => {
                                        res.json(result.affectedRows);
                                    }
                                )
                            } else {
                                res.json(result.affectedRows);
                            }
                        } else {
                            console.error('Error fetching USER_NO for the newly registered user.');
                            res.json(null);
                        }
                    }
                )
            }
        });
    },

    modifyConfirm: (req, res) => {
        let post = req.body;
        let sql = `
            UPDATE USER_IFM SET USER_PW = ?, USER_EMAIL = ?, USER_NICKNAME = ?, USER_MOD_DATE = NOW() WHERE USER_ID = ? 
        `;
        let state = [bcrypt.hashSync(post.mPw, 10), post.mEmail, post.mNickname, post.mId];

        DB.query(sql, state, (error, result) => {
            console.log('result ---> ', result);
            if (error) {
                res.json(null);
            } else {
                DB.query(
                    `SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
                    [post.mId],
                    (error, rows) => {
                        if (!error && rows.length > 0) {
                            res.json(result.affectedRows);
                        } else {
                            console.error('Error fetching USER_NO for the newly registered user.');
                            res.json(null);
                        }
                    }
                );
            }
        });
    },

    logoutConfirm: (req, res) => {
        let userToken = req.headers.authorization;
        if (!userToken) {
            console.log('userToken not found in headers');
            res.status(400).json({ error: 'User token not found' });
            return;
        }

        try {
            const token = userToken.split(' ')[1];
            console.log('token ----------> ', token);

            // Clear your application's cookies
            res.clearCookie('userToken');

            console.log('clearCookie Complete!!');
            res.json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Error clearing userToken cookie:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    memberDeleteConfirm: (req, res) => {
        let post = req.body;
        let userToken = req.headers.authorization;
        if (!userToken) {
            console.log('userToken not found in headers');
            res.status(400).json({ error: 'User token not found' });
            return;
        }

        try {
            DB.query(
                `DELETE FROM USER_IFM WHERE USER_ID = ?`,
                [post.userId],
                (error, result) => {
                    if (error) {
                        res.json(0);
                    } else {
                        const token = userToken.split(' ')[1];
                        console.log('token ----------> ', token);

                        // Clear your application's cookies
                        res.clearCookie('userToken');

                        console.log('clearCookie Complete!!');
                        res.json({ message: 'MEMBER DELETE successful' });
                    }
                }
            );
        } catch (error) {
            console.error('Error clearing userToken cookie:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    findPassword: (req, res) => {
        console.log('findPassword()');

        let post = req.body;
        console.log('post ---> ', post);

        let checkUserQuery = `
            SELECT * FROM USER_IFM WHERE USER_ID = ? AND USER_EMAIL = ?
        `;
        let checkUserParams = [post.yourId, post.yourEmail];
        console.log('checkUserParams ---> ', checkUserParams);

        DB.query(checkUserQuery, checkUserParams, (error, result) => {
            if (error) {
                console.error('회원 확인 중 오류 발생:', error);
                res.json(null);
            } else {
                if (result.length === 0) {
                    console.log('일치하는 회원 없음');
                    res.json({ error: '아이디와 이메일이 일치하지 않거나 존재하지 않습니다.' });
                } else {
                    console.log('일치하는 회원 찾음');
                    let newPassword = createNewPassword();
                    let sql = `UPDATE USER_IFM SET USER_PW = ?, USER_MOD_DATE = NOW() WHERE USER_ID = ?`;
                    let state = [bcrypt.hashSync(newPassword, 10), post.yourId];

                    DB.query(sql, state, (updateError, updateResult) => {
                        if (updateError) {
                            console.error('비밀번호 업데이트 에러:', updateError);
                            res.json(null);
                        } else {
                            console.log('업데이트된 행 수:', updateResult.affectedRows);
                            sendNewPasswordByMail(post.yourEmail, newPassword);
                            res.json(updateResult.affectedRows);
                        }
                    });
                }
            }
        });
    }
};

const createNewPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newPassword = '';
    for (let i = 0; i < 8; i++) {
        newPassword += characters.charAt(Math.random() * characters.length);
    }
    console.log('새로 생성된 비밀번호:', newPassword);
    return newPassword;
};

const sendNewPasswordByMail = (toMailAddr, newPassword) => {
    console.log('sendNewPasswordByMail()');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: emailAuth
    });

    const mailOptions = {
        from: 'kkslove2222@gmail.com',
        to: toMailAddr,
        subject: '[ChatSquare] 새 비밀번호 안내입니다.',
        text: `새 비밀번호: ${newPassword}, 로그인 후 비밀번호를 수정해주세요.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('이메일 전송 에러:', error);
        } else {
            console.log('이메일 전송 성공:', info.response);
        }
    });
};

module.exports = memberService;