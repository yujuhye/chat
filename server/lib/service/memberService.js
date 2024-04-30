const DB = require('../db/db');
const fs = require('fs');
const bcrypt = require('bcrypt');

const memberService = {

    getMember: (req, res) => {

        // 세션 검증
        if (req.query.sessionID === req.sessionID) {
            console.log('The session has not expired!!');

            DB.query(
                `
                    SELECT * FROM USER_IFM 
                    WHERE USER_ID = ?
                `,
                [req.user],
                (error, member) => {

                    if (error) {
                        res.json(null);

                    } else {

                        if (member.length > 0) {
                            res.json({
                                'sessionID': req.sessionID,
                                'member': member[0],
                            });

                        } else {
                            res.json(null);
                        }

                    }

                }

            )

        } else {
            console.log('The session has expired!!');

        }


        // 현재 로그인 되어 있는 사람의 정보를 제공

    },

    signUpConfirm: (req, res) => {

        let post = req.body;

        let sql = `
            INSERT INTO USER_IFM(USER_ID, USER_PW, USER_EMAIL, USER_NICKNAME ${(req.file !== undefined) ? `, USER_FRONT_IMG_NAME` : ``})
            VALUES(?, ?, ?, ? ${(req.file !== undefined) ? `, ?` : ``})
        `

        let state = [post.uId, bcrypt.hashSync(post.uPw, 10), post.uEmail, post.uNickname];
        if (req.file !== undefined) state.push(req.file.filename);

        DB.query(sql, state,
            (error, result) => {

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
                        `
                        SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?
                        `,
                        [post.uId],
                        (error, rows) => {
                            if (rows.length >= 0) {
                                let USER_NO = rows[0].USER_NO;

                                console.log('USER_NO ---> ', USER_NO);
                                if (req.file !== undefined) {

                                    DB.query(
                                        `
                                        INSERT INTO PROFILE_IMG(USER_NO, PROFILE_NAME, PROFILE_DIVIDE) 
                                        VALUES(?, ?, ?)
                                    `,
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


}

module.exports = memberService;