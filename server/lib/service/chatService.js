const DB = require('../db/db');
const fs = require('fs');

const chatService = {
    details: (req, res) => {
        let query = req.query;
        let roomNo = query.roomId;

        console.log('[chatService] details.roomNo -----> ', roomNo);

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
                C.*
            FROM
                CHAT AS C
            JOIN
                CHAT_PARTICIPANT AS CP ON C.ROOM_NO = CP.ROOM_NO
            WHERE
                C.ROOM_NO = ? 
            AND 
                CP.USER_NO = ? 
            AND 
                C.CHAT_REG_DATE > CP.PARTI_REG_DATE
            ORDER BY
                C.CHAT_REG_DATE ASC
        `;

        // 사용자 번호(userNo) 조회 쿼리 실행
        DB.query(userNo, [req.user], (error, results) => {
            if (error) {
                console.error('DB query error:', error);
                res.status(500).send('Database query failed');
                return;
            }
            if (results.length > 0) {
                let userNo = results[0].USER_NO; // 사용자 번호 추출

                // 첫 번째 쿼리 실행: userRoomsQuery
                DB.query(userRoomsQuery, [userNo], (error, userRoomsResults) => { // [user]를 [userNo]로 변경
                    if (error) {
                        console.error('DB query error:', error);
                        res.status(500).send('Database query failed');
                        return;
                    }

                    let userRooms = userRoomsResults;
                    console.log('[chatService] userRooms -----> ', userRooms);

                    // 다음 쿼리 실행: roomDetailsQuery
                    DB.query(roomDetailsQuery, [roomNo], (error, roomDetailsResults) => {
                        if (error) {
                            console.error('DB query error:', error);
                            res.status(500).send('Database query failed');
                            return;
                        }
                        let roomDetails = roomDetailsResults[0];
                        console.log('[chatService] roomDetails -----> ', roomDetails);

                        // 다음 쿼리 실행: participantsQuery
                        DB.query(participantsQuery, [roomNo, userNo], (error, participantsResults) => { // [user]를 [userNo]로 변경
                            if (error) {
                                console.error('DB query error:', error);
                                res.status(500).send('Database query failed');
                                return;
                            }

                            let participants = participantsResults;
                            console.log('[chatService] participants -----> ', participants);

                            // 다음 쿼리 실행: chatHistoryQuery
                            DB.query(chatHistoryQuery, [roomNo, userNo], (error, chatHistoryResults) => {
                                if (error) {
                                    console.error('DB query error:', error);
                                    res.status(500).send('Database query failed');
                                    return;
                                }

                                let chatHistory = chatHistoryResults;
                                console.log('[chatService] chatHistory -----> ', chatHistory);

                                // 최종 결과 응답
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
                res.status(404).send('User not found');
            }
        });
    },
    getJoinUser: (req, res) => {
        console.log('[chatService] getJoinUser()');

        let user = req.user;
        let roomNo = req.query.roomId; // URL의 쿼리 파라미터에서 roomId를 가져옵니다.
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

        DB.query(sql, [roomNo], (err, friends) => { // roomNo를 쿼리에 전달합니다.
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
                (ROOM_NO, USER_NICKNAME, CHAT_CONDITION, CHAT_IMAGE_NAME)
            VALUES 
                (?, ?, 1, ?)        
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
                    DB.query(submitImgSql, [post.roomId, userNickname, file.filename], (err, chatResult) => {
                        if (err) {
                            console.log("채팅 이미지 전송 중 에러 발생 -----> ", err);
    
                            if(file !== undefined) {
                                // fs.unlink(`C:\\ChatSquare\\chat\\upload\\chatImg\\${post.userId}\\${file.filename}`, (error) => {
                                fs.unlink(`C:\\ChatSquare\\chat\\upload\\chat\\${file.filename}`, (error) => {
                                    console.log('오류 발생 -----> ', error);
                                    console.log('UPLOADED FILE DELETE COMPLETED!!');
                                });
                            }
                            res.json(null);
                        } else {
                            console.log('채팅 이미지 전송 result ----->', chatResult);
                            const chatNo = chatResult.insertId; // 여기서 CHAT_NO를 얻음
    
                            // CHAT_IMAGE 테이블에 데이터 삽입, 여기서 chatNo를 직접 사용
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
                                    
                                } else {
                                    console.log('CHAT_IMAGE 테이블 삽입 결과 ----->', chatImgResult);
                                    res.json(chatImgResult.affectedRows);
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
                (ROOM_NO, USER_NICKNAME, CHAT_CONDITION, CHAT_VIDEO_NAME)
            VALUES 
                (?, ?, 2, ?)        
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
                    DB.query(submitVideoSql, [post.roomId, userNickname, file.filename], (err, chatResult) => {
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
                                    res.json(chatVideoResult.affectedRows);
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
                (ROOM_NO, USER_NICKNAME, CHAT_CONDITION, CHAT_FILE_NAME)
            VALUES 
                (?, ?, 3, ?)        
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
                            DB.query(chatFileTableInsertSql, [chatNo, post.userNo, file.filename], (err, chatFileResult) => {
                                if (err) {
                                    console.log("CHAT_FILE_NAME 테이블 삽입 중 에러 발생 -----> ", err);
                                    
                                } else {
                                    console.log('CHAT_FILE_NAME 테이블 삽입 결과 ----->', chatFileResult);
                                    res.json(chatFileResult.affectedRows);
                                }
                            });
                        }
                    });
                }
            });
        });
    },    
};

module.exports = chatService;