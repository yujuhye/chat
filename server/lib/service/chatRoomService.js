const DB = require('../db/db');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const getUserID = (req, res) => {
    const token = req.cookies['userToken'];
    console.log('토큰 -----> ', token);

    if (!token) {
        res.status(401).send('Access Denied. No Token Provided.');
        return null; // 토큰이 없을 때 null 반환
    }

    try {
        const decoded = jwt.verify(token, '1234');
        const userId = decoded.id;
        console.log(` ★★★★★ User ID is: ${userId}`);
        return userId; // 여기서 userId 반환
    } catch (err) {
        res.status(400).send('Invalid Token');
        return null; // 유효하지 않은 토큰일 때 null 반환
    }
}

const chatRoomService = {
    list: (req, res) => {
        const userId = getUserID(req, res);
        
        DB.query(`
            SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?
        `, [userId], (err, result) => {
            if (err) {
                console.log('오류 발생 ------> ', err);
                res.json(null);
            } else {
                if(result.length > 0) {
                    const userNo = result[0].USER_NO;
                    console.log('chat list userNo -----> ', userNo);

                    DB.query(`
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
                        CASE 
                            WHEN CM.CHAT_CONDITION = 0 THEN CM.LAST_CHAT_TEXT
                            WHEN CM.CHAT_CONDITION = 1 THEN "(이미지)"
                            WHEN CM.CHAT_CONDITION = 2 THEN "(영상)"
                            WHEN CM.CHAT_CONDITION = 3 THEN "(파일)"
                            ELSE "(새로운 채팅방입니다.)"
                        END AS LAST_CHAT_TEXT,
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
                                CHAT_CONDITION,
                                CHAT_REG_DATE AS LAST_CHAT_REG_DATE,
                                ROW_NUMBER() OVER(PARTITION BY ROOM_NO ORDER BY CHAT_REG_DATE DESC) AS rn
                            FROM 
                                CHAT
                        ) CM ON CR.ROOM_NO = CM.ROOM_NO AND CM.rn = 1
                    WHERE 
                        CP.USER_NO = ?
                    ORDER BY 
                        CP.PARTI_BOOKMARK DESC,
                        CM.LAST_CHAT_REG_DATE DESC                          
                    `, [userNo, userNo], (err, rooms) => { 
                        if(err) {
                            console.log('오류 발생 ------> ', err);
                            res.json(null);
                        } else {
                            res.json({
                                rooms: rooms, 
                            });
                        }
                    });
                } else {
                    console.log('결과가 없습니다.');
                    res.json(null);
                }
            }
        });
    },
    getFriendList: (req, res) => {
        const userId = getUserID(req, res);

        let findUserNoSql = `
            SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?
        `;
        DB.query(findUserNoSql, [userId], (err, result) => {
            if (err) {
                res.status(500).json({error: "USER_NO를 찾는 중 데이터베이스 오류가 발생했습니다."});
            } else {
                let userNo = result[0].USER_NO;
                console.log('getFriendList userNo -----> ', userNo);
        
                // USER_NO를 사용하여 친구 목록과 그들의 상세 정보를 찾는 쿼리
                let sql = `
                    SELECT FRIEND.*, U.*
                    FROM FRIEND
                    JOIN USER_IFM U ON FRIEND.FRIEND_TARGET_ID = U.USER_ID
                    WHERE FRIEND.FRIEND_IS_BLOCK = 0 AND FRIEND.USER_NO = ?
                `;
                DB.query(sql, [userNo], (err, friends) => {
                    if (err) {
                        res.status(500).json({error: "데이터베이스 쿼리 중 오류가 발생했습니다."});
                    } else {
                        res.json(friends);
                    }
                });
            }
        });
    },       
    modifyTitleConfirm: (req, res) => {

        let post = req.body;
        //let user = req.user; // 또는 다른 방식으로 사용자 번호를 받아옴
        //let user = '1';

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
        const userId = getUserID(req, res);

        let sql = 
        `
            SELECT * FROM USER_IFM WHERE USER_ID = ?
        `;
        DB.query(sql, [userId], (err, user) => {

            if(err) {
                
                res.json(null);

            } else {

                res.json(user[0]);

            }
        });

    },
    searChatRoom: (req, res) => {
        const userId = getUserID(req, res);
        let query = req.query;
    
        let sql = `
            SELECT * FROM CHAT_PARTICIPANT
            WHERE USER_NO = (
                SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?
            ) AND PARTI_CUSTOMZING_NAME LIKE CONCAT('%', ?, '%')
        `;
        DB.query(sql, [userId, query.parti_customzing_name], (err, chats) => {
            if(err) {
                console.log('검색 오류 -----> ', err);
                res.json(null);
            } else {
                console.log('검색 성공 -----> ', chats);
                res.json(chats);
            }
        });
    },
    
}

module.exports = chatRoomService;