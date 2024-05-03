const DB = require('../db/db');
const fs = require('fs');

const chatRoomService = {

    list: (req, res) => {
        //let user = req.user; // 또는 다른 방식으로 사용자 번호를 받아옴
        let user = '1';

        console.log('chat list user -----> ',user);
    
        DB.query(
        `
            SELECT 
                CR.ROOM_NO, 
                CR.ROOM_DEFAULT_NAME, 
                CR.ROOM_PERSONNEL,
                CP.PARTI_NO,
                CP.USER_NICKNAME,
                CP.USER_NO,
                CP.PARTI_CUSTOMZING_NAME,
                CP.PARTI_BOOKMARK,
                CP.PARTI_REG_DATE,
                CM.LAST_CHAT_TEXT,
                CM.LAST_CHAT_REG_DATE
            FROM 
                CHAT_PARTICIPANT CP
            INNER JOIN 
                CHAT_ROOM CR ON CP.ROOM_NO = CR.ROOM_NO
            LEFT JOIN 
                (
                    SELECT 
                        ROOM_NO, 
                        CHAT_TEXT AS LAST_CHAT_TEXT, 
                        CHAT_REG_DATE AS LAST_CHAT_REG_DATE,
                        ROW_NUMBER() OVER(PARTITION BY ROOM_NO ORDER BY CHAT_REG_DATE DESC) AS rn
                    FROM 
                        CHAT
                ) CM ON CR.ROOM_NO = CM.ROOM_NO AND CM.rn = 1
            WHERE 
                CP.USER_NO = ?
            ORDER BY 
                CM.LAST_CHAT_REG_DATE DESC
        
        `, [user], (err, rooms) => { 
    
            if(err) {
                res.json(null);
            } else {
                res.json({
                    rooms: rooms, 
                });
            }
    
        });
    },
    getFriendList: (req, res) => {
        let user = '1'; // 예시를 위한 하드코딩 값. 실제 작동 시 req를 통해 동적으로 받아와야 함.
    
        let sql = 
            `
                SELECT * FROM FRIEND WHERE FRIEND_IS_BLOCK = 0 AND USER_NO = ?
            `;
        DB.query(sql, [user], (err, friends) => { // SQL 인젝션 방지를 위해 사용자 입력값을 쿼리 매개변수로 바인딩
    
            if(err) {
                res.status(500).json({error: "데이터베이스 쿼리 중 오류가 발생했습니다."});
            } else {
                res.json(friends);
            }
    
        })
    },    
    modifyTitleConfirm: (req, res) => {

        let post = req.body;
        //let user = req.user; // 또는 다른 방식으로 사용자 번호를 받아옴
        let user = '1';

        let sql = 
        `
            UPDATE 
                CHAT_PARTICIPANT
            SET 
                PARTI_CUSTOMZING_NAME = ?
            WHERE 
                USER_NO = ? 
            AND 
                ROOM_NO = ?
        `;

        console.log('parti_customzing_name : ',post.parti_customzing_name);
        console.log('user_no : ',post.user_no);
        console.log('room_no : ',post.room_no);

        DB.query(sql, [post.parti_customzing_name, post.user_no, post.room_no], (err, result) => {

            if(err) {

                console.error(err);
                res.json(null);

            } else {

                res.json({'result': 1});
                console.log('parti_customzing_name : ',post.parti_customzing_name);
                console.log('user_no : ',post.user_no);
                console.log('room_no : ',post.room_no);

            }

        });

    },
    deleteChatRoom: (req, res) => {
        res.render('deleteChatRoom');
    },
    getUserInfo: (req, res) => {

        //let user = req.user; // 또는 다른 방식으로 사용자 번호를 받아옴
        let user = '1';

        let sql = 
        `
            SELECT * FROM USER_IFM WHERE USER_NO = ?
        `;
        DB.query(sql, [user], (err, user) => {

            if(err) {
                
                res.json(null);

            } else {

                res.json(user[0]);

            }
        });

    },

}

module.exports = chatRoomService;