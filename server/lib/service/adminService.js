const DB = require('../db/db');
const fs = require('fs');
const bcrypt = require('bcrypt');

const adminService = {

    getAdmin: (req, res) => {

        const adminSessionID = req.query.adminSessionID;

        console.log('req.query.adminSessionID ---> ', adminSessionID)
        console.log('req.adminSessionID ---> ', req.sessionID)

        // 세션 검증
        if (adminSessionID === req.sessionID) {
            console.log('The session has not expired!!');

            DB.query(
                `
                    SELECT * FROM ADMIN_IFM 
                    WHERE ADMIN_ID = ?
                `,
                [req.user],
                (error, admin) => {

                    if (error) {
                        res.json(null);

                    } else {

                        if (admin.length > 0) {
                            res.json({
                                'sessionID': req.sessionID,
                                'admin': admin[0],
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

    adminSignUpConfirm: (req, res) => {

        console.log('adminSignUpConfirm()');
        let post = req.body;
        console.log('req.body ----> ', req.body);
        console.log('post ----> ', post);

        let sql = `
            INSERT INTO ADMIN_IFM(ADMIN_ID, ADMIN_PW, ADMIN_EMAIL)
            VALUES(?, ?, ?)
        `

        let state = [post.aId, bcrypt.hashSync(post.aPw, 10), post.aEmail];

        DB.query(sql, state,
            (error, result) => {

                console.log('result ---> ', result);

                if (error) {

                    console.error('Error inserting into database:', error);
                    res.status(500).json({ error: 'Internal Server Error' });

                } else {
                    if (result.affectedRows > 0) {
                        res.json(result.affectedRows);
                    } else {
                        res.json({ success: false });
                    }
                }
            });
    }
}

module.exports = adminService;