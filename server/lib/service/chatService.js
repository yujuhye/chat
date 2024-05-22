const DB = require('../db/db');
const fs = require('fs');
const jwt = require('jsonwebtoken');
//const socket = require('../../socket/socket');

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

const chatService = {
    details: (req, res) => {
        let query = req.query;
        let roomNo = query.roomId;
        const userId = getUserID(req, res);

        console.log('[chatService] details.roomNo -----> ', roomNo);
        console.log('[chatService] details.userId -----> ', userId);

        let userNo = 
        `
            SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?
        `;

        let userRoomsQuery = 
        `
            SELECT 
                CR.*
            FROM 
                CHAT_ROOM CR
            JOIN 
                CHAT_PARTICIPANT CP ON CR.ROOM_NO = CP.ROOM_NO
            WHERE 
                CP.USER_NO = ?
        `;

        let roomDetailsQuery  =
        `
            SELECT 
                *
            FROM 
                CHAT_ROOM
            WHERE 
                ROOM_NO = ?
        `;

        let participantsQuery = 
        `
            SELECT 
                * 
            FROM 
                CHAT_PARTICIPANT
            WHERE 
                ROOM_NO = ?
            AND
                USER_NO = ?
        `;

        let chatHistoryQuery = 
        `
        SELECT
            C.*, CP.USER_NO
        FROM
            CHAT AS C
        JOIN
            CHAT_PARTICIPANT AS CP ON C.ROOM_NO = CP.ROOM_NO
        LEFT JOIN
            FRIEND F ON CP.USER_NO = F.USER_NO AND F.FRIEND_TARGET_ID = C.USER_NICKNAME AND F.FRIEND_IS_BLOCK = 1
        WHERE
            C.ROOM_NO = ? 
            AND CP.USER_NO = ? 
            AND C.CHAT_REG_DATE > CP.PARTI_REG_DATE
            AND (F.FRIEND_NO IS NULL OR F.FRIEND_IS_BLOCK = 0)
        ORDER BY
            C.CHAT_REG_DATE ASC    
        `;

        // 사용자 번호(userNo) 조회 쿼리 실행
        DB.query(userNo, [userId], (error, results) => {
            if (error) {
                console.error('DB query error:', error);
                res.status(500).send('Database query failed');
                return;
            }
            if (results.length > 0) {
                let userNo = results[0].USER_NO;

                DB.query(userRoomsQuery, [userNo], (error, userRoomsResults) => { 
                    if (error) {
                        console.error('DB query error:', error);
                        res.status(500).send('Database query failed');
                        return;
                    }

                    let userRooms = userRoomsResults;
                    console.log('[chatService] userRooms -----> ', userRooms);

                    DB.query(roomDetailsQuery, [roomNo], (error, roomDetailsResults) => {
                        if (error) {
                            console.error('DB query error:', error);
                            res.status(500).send('Database query failed');
                            return;
                        }
                        let roomDetails = roomDetailsResults[0];
                        console.log('[chatService] roomDetails -----> ', roomDetails);

                        DB.query(participantsQuery, [roomNo, userNo], (error, participantsResults) => { 
                            if (error) {
                                console.error('DB query error:', error);
                                res.status(500).send('Database query failed');
                                return;
                            }

                            let participants = participantsResults;
                            console.log('[chatService] participants -----> ', participants);

                            DB.query(chatHistoryQuery, [roomNo, userNo], (error, chatHistoryResults) => {
                                if (error) {
                                    console.error('DB query error:', error);
                                    res.status(500).send('Database query failed');
                                    return;
                                }

                                let chatHistory = chatHistoryResults;
                                console.log('[chatService] chatHistory -----> ', chatHistory);

                                res.json({
                                    roomDetails: roomDetails,
                                    participants: participants,
                                    chatHistory: chatHistory
                                });
                            });
                        });
                    });
                }); 
            } else {
                console.log('회원 못참음');
            }
        });
    },
    getJoinUser: (req, res) => {
        console.log('[chatService] getJoinUser()');

        let roomNo = req.query.roomId;
        console.log('getJoinUser roomNo -----> ', roomNo);

        let sql = 
        `
            SELECT 
                * 
            FROM 
                CHAT_PARTICIPANT 
            WHERE 
                ROOM_NO = ?
        `;

        DB.query(sql, [roomNo], (err, friends) => { 
            if(err) {
                console.error('DB query error:', err);
                res.status(500).send('Database query failed');
            } else {
                console.log('방에 참여한 사람들이 조회 되는지 확인 ----->', friends);
                res.json(friends);
            }
        });
    },
    searChatText: (req, res) => {
        let query = req.query;

        let sql =
        `
            SELECT * FROM CHAT WHERE ROOM_NO = ? AND CHAT_TEXT LIKE CONCAT('%', ?, '%')
        `;

        DB.query(sql, [query.roomId, query.chat_text], (err, contents) => {
            if(err) {
                console.log('검색 실패 -----> ', err);
                res.json(null);
            } else {
                console.log('검색 성공 -----> ', contents);
                res.json(contents);
            }
        })
    },
    submitImgFiles: (req, res) => {
        let post = req.body;
        console.log('채팅 이미지 전송 files ----->', post.chat_img_name);
        console.log('채팅 이미지 전송 userNo ----->', post.userNo);
        console.log('채팅 이미지 전송 userId ----->', post.userId);
        console.log('채팅 이미지 전송 roomId ----->', post.roomId);

        const now = new Date();
        now.setHours(now.getHours() + 9); // KST 시간으로 조정
        const kst = now.toISOString().slice(0, 19).replace('T', ' ');
    
        let userInfoSelectSql =
        `
            SELECT 
                USER_NICKNAME
            FROM 
                USER_IFM
            WHERE 
                USER_NO = ?
        `;
    
        let submitImgSql = 
        `
            INSERT INTO CHAT
                (ROOM_NO, USER_NICKNAME, CHAT_CONDITION, CHAT_IMAGE_NAME, CHAT_REG_DATE)
            VALUES 
                (?, ?, 1, ?, ?)        
        `;
    
        req.files.forEach(file => {
            DB.query(userInfoSelectSql, [post.userNo], (err, userInfoResult) => {
                if (err) {
                    console.log("사용자 정보 조회 중 에러 발생 -----> ", err);
                    res.json(null);
                } else {
                    console.log("유저 정보 조회 -----> ", userInfoResult);
    
                    const userNickname = userInfoResult[0].USER_NICKNAME;
                    console.log("유저 닉네임 조회 -----> ", userNickname);
    
                    DB.query(submitImgSql, [post.roomId, userNickname, file.filename, kst], (err, chatResult) => {
                        if (err) {
                            console.log("채팅 이미지 전송 중 에러 발생 -----> ", err);
    
                            if(file !== undefined) {
                                fs.unlink(`C:\\ChatSquare\\chat\\upload\\chat\\${file.filename}`, (error) => {
                                    console.log('오류 발생 -----> ', error);
                                    console.log('UPLOADED FILE DELETE COMPLETED!!');
                                });
                            }
                            res.json(null);
                        } else {
                            console.log('채팅 이미지 전송 result ----->', chatResult);
                            const chatNo = chatResult.insertId;
    
                            let chatImgTableInsertSql =
                            `
                                INSERT INTO CHAT_IMAGE
                                    (CHAT_NO, USER_NO, CHAT_IMAGE_NAME)
                                VALUES 
                                    (?, ?, ?)
                            `;
                            DB.query(chatImgTableInsertSql, [chatNo, post.userNo, file.filename], (err, chatImgResult) => {
                                if (err) {
                                    console.log("CHAT_IMAGE 테이블 삽입 중 에러 발생 -----> ", err);
                                    res.json(null);
                                } else {
                                    console.log('CHAT_IMAGE 테이블 삽입 결과 ----->', chatImgResult);
    
                                    // 파일 URL 생성 (여기서는 서버 URL과 업로드 경로를 기반으로 생성)
                                    const fileUrl = `C:\\ChatSquare\\chat\\upload\\chat\\${file.filename}`;
                                    
                                    const responseData = {
                                        affectedRows: chatImgResult.affectedRows,
                                        fileName: file.filename,
                                        fileUrl: fileUrl
                                    };
                                    
                                    res.json(responseData);
                                }
                            });
                        }
                    });
                }
            });
        });
    },     
    submitVideoFiles: (req, res) => {
        let post = req.body;
        console.log('채팅 영상 전송 files ----->', post.chat_video_name);
        console.log('채팅 영상 전송 userNo ----->', post.userNo);
        console.log('채팅 영상 전송 userId ----->', post.userId);
        console.log('채팅 영상 전송 roomId ----->', post.roomId);

        const now = new Date();
        now.setHours(now.getHours() + 9); // KST 시간으로 조정
        const kst = now.toISOString().slice(0, 19).replace('T', ' ');
    
        let userInfoSelectSql =
        `
            SELECT 
                USER_NICKNAME
            FROM 
                USER_IFM
            WHERE 
                USER_NO = ?
        `;
    
        let submitVideoSql = 
        `
            INSERT INTO CHAT
                (ROOM_NO, USER_NICKNAME, CHAT_CONDITION, CHAT_VIDEO_NAME, CHAT_REG_DATE)
            VALUES 
                (?, ?, 2, ?, ?)        
        `;
    
        // req.files를 통해 업로드된 파일들의 배열에 접근
        req.files.forEach(file => {
            // USER_NICKNAME 조회
            DB.query(userInfoSelectSql, [post.userNo], (err, userInfoResult) => {
                if (err) {
                    console.log("사용자 정보 조회 중 에러 발생 -----> ", err);
                    res.json(null);
                } else {
                    console.log("유저 정보 조회 -----> ", userInfoResult);
    
                    const userNickname = userInfoResult[0].USER_NICKNAME;
                    console.log("유저 닉네임 조회 -----> ", userNickname);
    
                    // CHAT 테이블에 데이터 삽입
                    DB.query(submitVideoSql, [post.roomId, userNickname, file.filename, kst], (err, chatResult) => {
                        if (err) {
                            console.log("채팅 영상 전송 중 에러 발생 -----> ", err);
    
                            if(file !== undefined) {
                                // fs.unlink(`C:\\ChatSquare\\chat\\upload\\chatVideo\\${post.userId}\\${file.filename}`, (error) => {
                                fs.unlink(`C:\\ChatSquare\\chat\\upload\\chat\\${file.filename}`, (error) => {
                                    console.log('오류 발생 -----> ', error);
                                    console.log('UPLOADED FILE DELETE COMPLETED!!');
                                });
                            }
                            res.json(null);
                        } else {
                            console.log('채팅 영상 전송 result ----->', chatResult);
                            const chatNo = chatResult.insertId; // 여기서 CHAT_NO를 얻음
    
                            // CHAT_VIDEO 테이블에 데이터 삽입, 여기서 chatNo를 직접 사용
                            let chatVideoTableInsertSql =
                            `
                                INSERT INTO CHAT_VIDEO
                                    (CHAT_NO, USER_NO, CHAT_VIDEO_NAME)
                                VALUES 
                                    (?, ?, ?)
                            `;
                            DB.query(chatVideoTableInsertSql, [chatNo, post.userNo, file.filename], (err, chatVideoResult) => {
                                if (err) {
                                    console.log("CHAT_VIDEO_NAME 테이블 삽입 중 에러 발생 -----> ", err);
                                    
                                } else {
                                    console.log('CHAT_VIDEO_NAME 테이블 삽입 결과 ----->', chatVideoResult);

                                    // 파일 URL 생성 (여기서는 서버 URL과 업로드 경로를 기반으로 생성)
                                    const fileUrl = `C:\\ChatSquare\\chat\\upload\\chat\\${file.filename}`;
                                    
                                    const responseData = {
                                        affectedRows: chatVideoResult.affectedRows,
                                        fileName: file.filename,
                                        fileUrl: fileUrl
                                    };
                                    
                                    res.json(responseData);
                                }
                            });
                        }
                    });
                }
            });
        });
    },    
    submitFiles: (req, res) => {
        let post = req.body;
        console.log('채팅 파일 전송 files ----->', post.chat_file_name);
        console.log('채팅 파일 전송 userNo ----->', post.userNo);
        console.log('채팅 파일 전송 userId ----->', post.userId);
        console.log('채팅 파일 전송 roomId ----->', post.roomId);

        const now = new Date();
        now.setHours(now.getHours() + 9); // KST 시간으로 조정
        const kst = now.toISOString().slice(0, 19).replace('T', ' ');
    
        let userInfoSelectSql =
        `
            SELECT 
                USER_NICKNAME
            FROM 
                USER_IFM
            WHERE 
                USER_NO = ?
        `;
    
        let submitFileSql = 
        `
            INSERT INTO CHAT
                (ROOM_NO, USER_NICKNAME, CHAT_CONDITION, CHAT_FILE_NAME, CHAT_REG_DATE)
            VALUES 
                (?, ?, 3, ?, ?)        
        `;
    
        // req.files를 통해 업로드된 파일들의 배열에 접근
        req.files.forEach(file => {
            // USER_NICKNAME 조회
            DB.query(userInfoSelectSql, [post.userNo], (err, userInfoResult) => {
                if (err) {
                    console.log("사용자 정보 조회 중 에러 발생 -----> ", err);
                    res.json(null);
                } else {
                    console.log("유저 정보 조회 -----> ", userInfoResult);
    
                    const userNickname = userInfoResult[0].USER_NICKNAME;
                    console.log("유저 닉네임 조회 -----> ", userNickname);
    
                    // CHAT 테이블에 데이터 삽입
                    DB.query(submitFileSql, [post.roomId, userNickname, file.filename], (err, chatResult) => {
                        if (err) {
                            console.log("채팅 파일 전송 중 에러 발생 -----> ", err);
    
                            if(file !== undefined) {
                                // fs.unlink(`C:\\ChatSquare\\chat\\upload\\chatFile\\${post.userId}\\${file.filename}`, (error) => {
                                fs.unlink(`C:\\ChatSquare\\chat\\upload\\chat\\${file.filename}`, (error) => {
                                    console.log('오류 발생 -----> ', error);
                                    console.log('UPLOADED FILE DELETE COMPLETED!!');
                                });
                            }
                            res.json(null);
                        } else {
                            console.log('채팅 파일 전송 result ----->', chatResult);
                            const chatNo = chatResult.insertId; // 여기서 CHAT_NO를 얻음
    
                            // CHAT_FILE_NAME 테이블에 데이터 삽입, 여기서 chatNo를 직접 사용
                            let chatFileTableInsertSql =
                            `
                                INSERT INTO CHAT_FILE
                                    (CHAT_NO, USER_NO, CHAT_FILE_NAME)
                                VALUES 
                                    (?, ?, ?)
                            `;
                            DB.query(chatFileTableInsertSql, [chatNo, post.userNo, file.filename, kst], (err, chatFileResult) => {
                                if (err) {
                                    console.log("CHAT_FILE_NAME 테이블 삽입 중 에러 발생 -----> ", err);
                                    
                                } else {
                                    console.log('CHAT_FILE_NAME 테이블 삽입 결과 ----->', chatFileResult);

                                    // 파일 URL 생성 (여기서는 서버 URL과 업로드 경로를 기반으로 생성)
                                    const fileUrl = `C:\\ChatSquare\\chat\\upload\\chat\\${file.filename}`;
                                    
                                    const responseData = {
                                        affectedRows: chatFileResult.affectedRows,
                                        fileName: file.filename,
                                        fileUrl: fileUrl
                                    };
                                    
                                    res.json(responseData);
                                }
                            });
                        }
                    });
                }
            });
        });
    },  
    profile: (req, res) => {
        console.log('profile!');
        const selectedUserNo = req.query.selectedUserNo; // 선택한 참여자 번호
        const userId = getUserID(req, res);              // 현재 로그인한 사람의 아이디
    
        console.log('selected user no!!!!!!!! -----> ', selectedUserNo);
        console.log('user id!!!!!!!! -----> ', userId);
    
        // 로그인한 사용자의 userNo를 조회하는 쿼리
        let userNoSql = `SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`;
    
        DB.query(userNoSql, [userId], (userNoError, result) => {
            if (userNoError) {
                console.log('userNo 조회 오류!!!!!!!! -----> ', userNoError);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
    
            if (result.length > 0) {
                const userNo = result[0].USER_NO;
    
                // 선택한 사용자의 프로필 정보 조회
                DB.query(`SELECT * FROM USER_IFM WHERE USER_NO = ?`, [selectedUserNo], (error, user) => {
                    if (user !== null && user.length > 0) {
                        console.log('user no 성공!!!!!!!! -----> ', user[0]);
    
                        // 친구 상태 확인
                        DB.query(`SELECT * FROM FRIEND WHERE USER_NO = ? AND FRIEND_TARGET_ID = ?`, 
                        [userNo, user[0].USER_ID], (friendError, friend) => {
                            if (friendError) {
                                console.log('friend query error!!!! -----> ', friendError);
                                res.status(500).json({ error: 'Internal Server Error' });
                                return;
                            }
    
                            const isFriend = friend !== null && friend.length > 0;
                            const userProfile = {
                                ...user[0],
                                isFriend: isFriend
                            };
    
                            console.log('차단 여부 확인  >>>>> ', userProfile);
    
                            res.json(userProfile);
                        });
                    } else {
                        console.log('user no 오류!!!!!!!! -----> ', error);
                        res.json(null);
                    }
                });
            } else {
                console.log('user id로 user no를 찾을 수 없습니다.');
                res.status(404).json({ error: '유저 없음' });
            }
        });
    }
};

module.exports = chatService;