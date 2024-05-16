const DB = require('../db/db');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminService = {

    getAdmin: (req, res) => {

        let adminToken = req.headers.authorization;

        if (!adminToken) {
            adminToken = req.cookies ? req.cookies['adminToken'] : null;
        }

        if (adminToken) {
            console.log('adminToken --> ', adminToken);
            console.log('The admin session has not expired!!');

            const jwtOptions = {
                secretOrKey: '1234',
            };

            jwt.verify(adminToken.split(' ')[1], jwtOptions.secretOrKey, (err, decoded) => {
                if (err) {
                    console.error('Error decoding JWT token:', err);
                    res.status(401).json({ error: 'Invalid token' });
                    return;
                }

                const adminId = decoded.id;

                DB.query(
                    `
                        SELECT * FROM ADMIN_IFM 
                    WHERE ADMIN_ID = ?
                    `,
                    [adminId],
                    (error, admin) => {
                        if (error) {
                            res.json(null);
                        } else {
                            if (admin.length > 0) {
                                res.json({
                                    'adminToken': adminToken,
                                    'admin': admin[0],
                                });

                                console.log('admin[0].ADMIN_ID ---> ', admin[0].ADMIN_ID);
                            } else {
                                res.json(null);
                            }
                        }
                    }
                );
            });
        } else {
            console.log('The admin session has expired or no token was found!!');
            res.status(401).json({ error: 'No admin token provided or token expired' });
        }
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
    },

    newsWriteConfirm: (req, res) => {
        console.log('newsWriteConfirm()');

        let post = req.body;

        console.log('req.body ----> ', req.body);
        console.log('req.user ----> ', req.user);

        DB.query(
            `
                SELECT * FROM ADMIN_IFM 
                WHERE ADMIN_ID = ?
            `,
            [req.user.ADMIN_ID],
            (error, admin) => {
                if (error) {
                    console.error('Error fetching admin information:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    if (admin.length > 0) {

                        let ADMIN_ID = admin[0].ADMIN_ID;

                        let sql = `
                            INSERT INTO NEWS(NEWS_TITLE, NEWS_CONTENT, ADMIN_ID)
                            VALUES(?, ?, ?)
                        `;

                        let state = [post.newsTitle, post.newsContent, ADMIN_ID];

                        DB.query(sql, state,
                            (error, result) => {
                                if (error) {
                                    console.error('Error inserting into database:', error);
                                    res.status(500).json({ error: 'Internal Server Error' });
                                } else {
                                    if (result.affectedRows > 0) {
                                        console.log('result ----> ', result.affectedRows);
                                        res.json(result.affectedRows);
                                    } else {
                                        res.json({ success: false });
                                    }
                                }
                            });
                    } else {
                        res.status(404).json({ error: 'Admin not found' });
                    }
                }
            }
        );
    },

    getNews: (req, res) => {
        console.log('getNews()');

        DB.query(
            `
            SELECT NEWS_TITLE, NEWS_REG_DATE FROM NEWS ORDER BY NEWS_REG_DATE DESC;
            `,
            (error, newsList) => {
                if (error || !newsList) {
                    console.error('Error fetching news:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('newsList ---> ', newsList);
                    res.json({ newsList });
                }
            }
        );
    },

    getNewsContent: (req, res) => {
        console.log('getNewsContent()');

        const index = parseInt(req.query.index);

        DB.query(
            `
            SELECT NEWS_CONTENT FROM NEWS WHERE NEWS_NO = (
                SELECT NEWS_NO FROM NEWS ORDER BY NEWS_MOD_DATE DESC LIMIT ?, 1
            );
            `,
            [index],
            (error, newsContent) => {
                if (error || !newsContent) {
                    console.error('Error fetching news content:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('newsContent ---> ', newsContent);
                    res.json({ newsContent });
                }
            }
        );
    },

    UserStatus: (req, res) => {
        console.log('UserStatus()');

        DB.query(
            `
            SELECT 
                YEAR(USER_REG_DATE) AS regYear,
                MONTH(USER_REG_DATE) AS regMonth,
                COUNT(*) AS registrationCount
            FROM 
                USER_IFM
            GROUP BY 
                regYear, regMonth
            ORDER BY 
                regYear, regMonth;
            `,
            (error, result) => {
                if (error || !result) {
                    console.error('Error fetching monthly registration data:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('Monthly registration data:', result);
                    res.json(result);
                }
            }
        );

    }
}

module.exports = adminService;