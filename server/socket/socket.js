const DB = require('../lib/db/db');

async function fetchMessagesFromDatabase(roomId, userNo) {
    console.log('[socket] fetchMessagesFromDatabase roomId -----> ', roomId);
    console.log('[socket] fetchMessagesFromDatabase userNo -----> ', userNo);

    return new Promise((resolve, reject) => {
        const chatDataSql = 
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

        DB.query(chatDataSql, [roomId, userNo], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results);
        });
    });
}

module.exports = function(io) {
    io.on('connection', (socket) => {
        // 사용자 ID와 소켓 ID를 매핑하는 객체
        let userSocketMap = {};

        // 사용자 로그인 또는 소켓 연결 시 사용자 ID와 소켓 ID 매핑
        socket.on('login', (userId) => {
            console.log('로그인 했음!!!! -----> ',userId);
            userSocketMap[userId] = socket.id;
        });
        
        console.log('A user connected');

        // 여기부터
        socket.on('chatRoomCreated', (data) => {
            const { userInfo, friendNo, friendName, roomName } = data;
        
            const userNo = userInfo.USER_NO;
            const userName = userInfo.USER_NICKNAME;
        
            // 친구의 FRIEND_TARGET_ID를 조회
            const queryFriendTargetId = `SELECT FRIEND_TARGET_ID FROM FRIEND WHERE FRIEND_NO = ?`;
            DB.query(queryFriendTargetId, [friendNo], (err, friendResults) => {
                if (err) {
                    socket.emit('error', err.message);
                    return;
                }
                if (friendResults.length === 0) {
                    socket.emit('error', 'No friend found with the given friend number');
                    return;
                }
                const friendTargetId = friendResults[0].FRIEND_TARGET_ID;
        
                // FRIEND_TARGET_ID를 사용하여 USER_NO를 조회
                const queryFriendUserNo = `SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`;
                DB.query(queryFriendUserNo, [friendTargetId], (err, userResults) => {
                    if (err) {
                        socket.emit('error', err.message);
                        return;
                    }
                    if (userResults.length === 0) {
                        socket.emit('error', 'No user found with the given friend ID');
                        return;
                    }
                    const friendUserNo = userResults[0].USER_NO;
        
                    // 트랜잭션 시작
                    DB.beginTransaction(err => {
                        if (err) {
                            socket.emit('error', err.message);
                            return;
                        }
        
                        const createRoomSql = `INSERT INTO CHAT_ROOM (ROOM_DEFAULT_NAME) VALUES (?)`;
                        DB.query(createRoomSql, [roomName], (err, result) => {
                            if (err) {
                                return DB.rollback(() => {
                                    socket.emit('error', err.message);
                                });
                            }
        
                            const roomNo = result.insertId;
                            const addParticipantsSql = `
                                INSERT INTO CHAT_PARTICIPANT (ROOM_NO, USER_NO, USER_NICKNAME, PARTI_CUSTOMZING_NAME, PARTI_REG_DATE)
                                VALUES (?, ?, ?, ?, NOW())
                            `;
        
                            // 현재 유저 추가
                            DB.query(addParticipantsSql, [roomNo, userNo, userName, roomName], (err) => {
                                if (err) {
                                    return DB.rollback(() => {
                                        socket.emit('error', err.message);
                                    });
                                }
        
                                // 친구 추가
                                DB.query(addParticipantsSql, [roomNo, friendUserNo, friendName, roomName], (err) => {
                                    if (err) {
                                        return DB.rollback(() => {
                                            socket.emit('error', err.message);
                                        });
                                    }
        
                                    DB.commit(err => {
                                        if (err) {
                                            return DB.rollback(() => {
                                                socket.emit('error', err.message);
                                            });
                                        }
                                        socket.emit('roomCreated', { roomNo, roomName });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });                   
        // 여기까지 추가

        // 채팅방 생성
        socket.on('createRoom', (roomInfo) => { 
            const roomName = roomInfo.room_default_name;            // 방 이름
            const roomPersonnel = roomInfo.participants.length + 1; // 방참여 인원
            const userInfo = {
                USER_NO: roomInfo.userInfo.USER_NO,
                FRIEND_TARGET_NAME: roomInfo.userInfo.USER_NICKNAME,
            };

            const userNo = roomInfo.userInfo.USER_NO;
        
            let creatrRoomSql = 
            `
                INSERT INTO 
                CHAT_ROOM(ROOM_DEFAULT_NAME, ROOM_PERSONNEL) 
                VALUES(?, ?)
            `;
            DB.query(creatrRoomSql, [roomName, roomPersonnel], (err, result) => {
                if(err) {
                    console.log('create chat room error! ---> ', err);
                    socket.emit('chat room create fail', err.message);
                    return;
                }
        
                console.log('chat room create success!');
                const roomId = result.insertId;
        
                roomInfo.participants.push(userInfo); // PUSH에서 변경
        
                // Promise.all을 사용하여 모든 참여자 추가 작업을 동기적으로 처리
                let participantPromises = roomInfo.participants.map(participant => {
                    return new Promise((resolve, reject) => {
                        let sqlInsertParticipant = `
                            INSERT INTO CHAT_PARTICIPANT(ROOM_NO, USER_NO, USER_NICKNAME, PARTI_REG_DATE, PARTI_CUSTOMZING_NAME) 
                            VALUES(?, ?, ?, NOW(), 
                            (SELECT ROOM_DEFAULT_NAME FROM CHAT_ROOM WHERE ROOM_NO = ?)
                        )
                        `;
        
                        const participantUserNo = participant.USER_NO;
                        const friendNickname = participant.FRIEND_TARGET_NAME;
        
                        DB.query(sqlInsertParticipant, [roomId, participantUserNo, friendNickname, roomId], (err, participantResult) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(participantResult);
                            }
                        });
                    });
                });
        
                Promise.all(participantPromises).then(() => {
                    // 모든 참여자 정보가 성공적으로 추가되었을 때, 채팅방 리스트 조회 및 전송
                    let refreshSql = 
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
                        CM.LAST_CHAT_REG_DATE DESC                
                    `;
        
                    DB.query(refreshSql, [userNo], (refreshErr, rooms) => {
                        if(refreshErr) {
                            console.log('Error fetching rooms list after creation --->', refreshErr);
                            return;
                        }
        
                        // 조회된 채팅방 리스트를 모든 사용자에게 전송
                        //console.log('서버 로그 확인용 update room list --->', rooms);
                        io.emit('update room list', rooms);
                    });
                }).catch((error) => {
                    console.log('Error adding participants --->', error);
                });
        
                // 성공 메시지를 소켓을 통해 전송
                socket.emit('roomCreated', {id: roomId, name: roomName});
            });
        });        

        // 친구 초대
        socket.on('invite room', function(data) {
            const selectedFriends = data.selectedFriends; // 초대된 친구들의 정보
            const roomId = data.roomId;
            const participants = data.participants;

            console.log('친구 초대 roomId -----> ', roomId);
            console.log('친구 초대 selectedFriends -----> ', selectedFriends);
            console.log('친구 초대 data -----> ', data);

            // 현 방의 현재 참여자 수를 조회
            let sqlSelect = `SELECT ROOM_PERSONNEL, ROOM_DEFAULT_NAME FROM CHAT_ROOM WHERE ROOM_NO = ?`;
            DB.query(sqlSelect, [roomId], (err, result) => {
                if(err) {
                    console.error('쿼리 실행 중 오류 발생:', err);
                    return;
                }

                console.log('친구 초대 result -----> ', result);

                const currentPersonnel = result[0].ROOM_PERSONNEL;
                const roomDefaultName = result[0].ROOM_DEFAULT_NAME; // 채팅방 기본 이름 조회
                const newPersonnel = currentPersonnel + selectedFriends.length;

                // 참여자 수를 업데이트
                let sqlUpdate = `UPDATE CHAT_ROOM SET ROOM_PERSONNEL = ? WHERE ROOM_NO = ?`;
                DB.query(sqlUpdate, [newPersonnel, roomId], (err, updateResult) => {
                    if(err) {
                        throw err;
                    }

                    let invitedFriends = []; // 초대된 친구들의 닉네임 목록

                    selectedFriends.forEach(friendNo => {
                        const friend = participants.find(participant => participant.FRIEND_NO === friendNo);
                        if (friend) {
                            invitedFriends.push(friend.USER_NICKNAME);
                            let sqlInsert = `INSERT INTO CHAT_PARTICIPANT (ROOM_NO, USER_NO, USER_NICKNAME, PARTI_CUSTOMZING_NAME, PARTI_REG_DATE) VALUES (?, ?, ?, ?, NOW())`;
                            DB.query(sqlInsert, [roomId, friend.USER_NO, friend.USER_NICKNAME, roomDefaultName], (err, result) => {
                                if(err) {
                                    throw err;
                                }
                                console.log('CHAT_PARTICIPANT 삽입 성공', result);
                            });
                        } else {
                            console.log('해당 번호의 친구 정보를 찾을 수 없음', friendNo);
                        }
                    });

                    // 초대 알림 메시지 생성
                    const inviteMessage = {
                        type: 'invite',
                        content: `${invitedFriends.join(', ')}님이 초대되었습니다.`,
                        roomId: roomId,
                        timestamp: new Date().toISOString()
                    };

                    // 방에 있는 모든 사용자에게 알림 메시지 전송
                    io.to(roomId).emit('receiveInviteMessage', inviteMessage);

                    // 특정 방에 있는 모든 사용자에게 채팅 리스트 갱신 요청
                    io.emit('refreshChatList');
                    io.emit('newRoomInfo', {
                        roomId: roomId,
                        roomName: roomDefaultName,
                        roomPersonnel: newPersonnel
                    });

                    socket.emit('load old msgs', updateResult);
                });
            });
        });

        // 방 입장
        socket.on('joinRoom', async ({ roomId, userNo }) => {
            
            socket.join(roomId);
            console.log('★★입장★★');
            console.log('User joined room: ', roomId);
            console.log('User joined user: ', userNo);
            
            const messages = await fetchMessagesFromDatabase(roomId, userNo);
            
            socket.emit('loadOldMessages', messages);
            
            socket.to(roomId).emit('userJoined', {user: '새로운 사용자', message: '입장했습니다.'});

        });

        // 파일 전송 후 방에 참여한 사람들에게 바로 보이게 하기
        socket.on('submitFile', async (data) => {
            const { roomId, userNo } = data;

            // 데이터베이스에서 메시지 가져오기
            const messages = await fetchMessagesFromDatabase(roomId, userNo);

            // 마지막 메시지를 가져오기
            const lastMessage = messages[messages.length - 1];

            // 마지막 메시지에 fileName 추가
            let updatedMessages = { ...lastMessage };

            let chatInfo = {
                messages: updatedMessages,
            };

            console.log('File file************* -----> ', chatInfo);
            console.log('File chat room no ************* -----> ', roomId);

            // 방에 있는 모든 사용자에게 파일 정보와 추가 정보 전송
            io.to(roomId).emit('receiveFile', chatInfo);

            // 특정 방에 있는 모든 사용자에게 채팅 리스트 갱신 요청
            io.to(roomId).emit('refreshChatList');
        });

        // 읽음 처리
        socket.on('updateReadCnt', async (roomId, userInfos) => {
            console.log('읽음 처리 >>>>> roomId -----> ', roomId);
            console.log('읽음 처리 >>>>> userInfos -----> ', userInfos);

            // 보류
        });

        // 메시지 전송
        // socket.on('sendMessage', (data) => {
        //     const { sender, content, roomId, userNo } = data;
        
        //     console.log('sender -----> ', sender);
        //     console.log('userNo -----> ', userNo);
        
        //     const now = new Date();
        //     now.setHours(now.getHours() + 9); // KST 시간으로 조정
        //     const kst = now.toISOString().slice(0, 19).replace('T', ' ');
        
        //     let sql = `INSERT INTO CHAT(ROOM_NO, USER_NICKNAME, CHAT_CONDITION, CHAT_TEXT, CHAT_REG_DATE) VALUES(?, ?, 0, ?, ?)`;
        
        //     DB.query(sql, [roomId, sender, content, kst], (err, result) => {
        //         if (err) {
        //             console.error('Error inserting message into database', err);
        //             return;
        //         }
        
        //         console.log('메시지 전송 성공!!!!! -----> ', result);
        
        //         let sql = `SELECT USER_NO FROM CHAT_PARTICIPANT WHERE ROOM_NO = ?`;
        //         DB.query(sql, [roomId], (err, users) => {
        //             if (err) {
        //                 console.error('오류오류!!! -----> ', err);
        //                 return;
        //             }
        
        //             // 차단된 사용자 목록 가져오기
        //             let blockSql = `SELECT FRIEND_IS_BLOCK FROM FRIEND WHERE USER_NO = ?`;
        //             DB.query(blockSql, [userNo], (blockErr, blockedUsers) => {
        //                 if (blockErr) {
        //                     console.error('차단된 사용자 목록 조회 오류 -----> ', blockErr);
        //                     return;
        //                 }
        
        //                 let blockedUserNos = blockedUsers.map(user => user.BLOCKED_USER_NO);
        //                 let usersInRoom = users.map(user => user.USER_NO).filter(user => !blockedUserNos.includes(user));
        
        //                 usersInRoom.forEach(user => {
        //                     let readStatus = user === userNo ? 1 : 0;
        //                     console.log('읽음 읽지 않음 처리 -----> user : ', user);
        //                     console.log('읽음 읽지 않음 처리 -----> senderUserNo : ', userNo);
        
        //                     let sql = `INSERT INTO CHAT_READ_STATUS(CHAT_NO, USER_NO, READ_STATUS) VALUES(?, ?, ?)`;
        //                     DB.query(sql, [result.insertId, user, readStatus], (err, insertResult) => {
        //                         if (err) {
        //                             console.error('CHAT_READ_STATUS 업데이트 오류 발생 -----> ', err);
        //                             return;
        //                         }
        //                         console.log('CHAT_READ_STATUS 업데이트 성공 -----> ', insertResult);
                                
        //                         io.emit('refreshChatList');
        //                     });
        //                 });
        
        //                 let unreadCountSql = `SELECT COUNT(USER_NO) AS UNREAD_COUNT FROM CHAT_READ_STATUS WHERE READ_STATUS = 0 AND CHAT_NO = ? AND USER_NO != ?`;
        //                 DB.query(unreadCountSql, [result.insertId, userNo], (err, unreadResult) => {
        //                     if (err) {
        //                         console.error('UNREAD_COUNT 쿼리 오류 발생 -----> ', err);
        //                         return;
        //                     }
        //                     console.log('UNREAD_COUNT 쿼리 실행 성공 -----> ', unreadResult);
        
        //                     const messageToSend = {
        //                         sender: sender,
        //                         content: content,
        //                         sentAt: kst,
        //                         status: 0,
        //                         userNo: userNo,
        //                         readStatus: false,
        //                         unreadCount: unreadResult[0].UNREAD_COUNT,
        //                     };
        //                     console.log('메시지 전송 채팅 방번호 확인!!!! >>>>> ', roomId);
        
        //                     // 방에 있는 사용자에게만 메시지 전송
        //                     io.to(roomId).emit('receiveMessage', messageToSend);
        
        //                     // 사용자가 채팅방에 없을 때 개별 알림 보내기
        //                     usersInRoom.forEach(user => {
        //                         if (userSocketMap[user] && !io.sockets.adapter.rooms.get(roomId)?.has(userSocketMap[user])) {
        //                             io.to(userSocketMap[user]).emit('receiveMessage', messageToSend);
        //                         }
        //                     });
        //                 });
        //             });
        //         });
        //     });
        // });

        socket.on('sendMessage', (data) => {
            const { sender, content, roomId, userNo } = data;
        
            console.log('sender -----> ', sender);
            console.log('userNo -----> ', userNo);
        
            const now = new Date();
            now.setHours(now.getHours() + 9); // KST 시간으로 조정
            const kst = now.toISOString().slice(0, 19).replace('T', ' ');
        
            // 차단된 사용자 목록 조회
            const blockSql = `SELECT FRIEND_TARGET_ID FROM FRIEND WHERE USER_NO = ? AND FRIEND_IS_BLOCK = 1`;
            DB.query(blockSql, [userNo], (blockErr, blockedUsers) => {
                if (blockErr) {
                    console.error('차단된 사용자 목록 조회 오류 -----> ', blockErr);
                    return;
                }
        
                const blockedUserNos = blockedUsers.map(user => user.FRIEND_TARGET_ID);
        
                // 보낸 메시지를 차단한 사용자에 의해 보내진 경우 처리 중지
                if (blockedUserNos.includes(sender)) {
                    console.log('차단된 사용자가 메시지를 보냈습니다.');
                    return;
                }
        
                const insertMessageSql = `INSERT INTO CHAT(ROOM_NO, USER_NICKNAME, CHAT_CONDITION, CHAT_TEXT, CHAT_REG_DATE) VALUES(?, ?, 0, ?, ?)`;
        
                DB.query(insertMessageSql, [roomId, sender, content, kst], (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error('Error inserting message into database', insertErr);
                        return;
                    }
        
                    console.log('메시지 전송 성공!!!!! -----> ', insertResult);
        
                    const selectParticipantsSql = `SELECT USER_NO FROM CHAT_PARTICIPANT WHERE ROOM_NO = ?`;
                    DB.query(selectParticipantsSql, [roomId], (participantsErr, users) => {
                        if (participantsErr) {
                            console.error('오류오류!!! -----> ', participantsErr);
                            return;
                        }
        
                        const usersInRoom = users.map(user => user.USER_NO);
        
                        usersInRoom.forEach(user => {
                            const readStatus = user === userNo ? 1 : 0;
                            console.log('읽음 읽지 않음 처리 -----> user : ', user);
                            console.log('읽음 읽지 않음 처리 -----> senderUserNo : ', userNo);
        
                            const updateReadStatusSql = `INSERT INTO CHAT_READ_STATUS(CHAT_NO, USER_NO, READ_STATUS) VALUES(?, ?, ?)`;
                            DB.query(updateReadStatusSql, [insertResult.insertId, user, readStatus], (readStatusErr, readStatusResult) => {
                                if (readStatusErr) {
                                    console.error('CHAT_READ_STATUS 업데이트 오류 발생 -----> ', readStatusErr);
                                    return;
                                }
                                console.log('CHAT_READ_STATUS 업데이트 성공 -----> ', readStatusResult);
        
                                io.emit('refreshChatList');
                            });
                        });
        
                        const unreadCountSql = `SELECT COUNT(USER_NO) AS UNREAD_COUNT FROM CHAT_READ_STATUS WHERE READ_STATUS = 0 AND CHAT_NO = ? AND USER_NO != ?`;
                        DB.query(unreadCountSql, [insertResult.insertId, userNo], (unreadCountErr, unreadCountResult) => {
                            if (unreadCountErr) {
                                console.error('UNREAD_COUNT 쿼리 오류 발생 -----> ', unreadCountErr);
                                return;
                            }
                            console.log('UNREAD_COUNT 쿼리 실행 성공 -----> ', unreadCountResult);
        
                            const messageToSend = {
                                sender: sender,
                                content: content,
                                sentAt: kst,
                                status: 0,
                                userNo: userNo,
                                readStatus: false,
                                unreadCount: unreadCountResult[0].UNREAD_COUNT,
                            };
                            console.log('메시지 전송 채팅 방번호 확인!!!! >>>>> ', roomId);
        
                            // 방에 있는 사용자에게만 메시지 전송
                            io.to(roomId).emit('receiveMessage', messageToSend);
        
                            // 사용자가 채팅방에 없을 때 개별 알림 보내기
                            usersInRoom.forEach(user => {
                                if (userSocketMap[user] && !io.sockets.adapter.rooms.get(roomId)?.has(userSocketMap[user])) {
                                    io.to(userSocketMap[user]).emit('receiveMessage', messageToSend);
                                }
                            });
                        });
                    });
                });
            });
        });
            
        // 채팅방 떠남
        socket.on('leaveRoom', function(data){
            console.log('채팅방 떠남 ----->', data); // 방 번호 & 회원 번호
            //console.log('채팅방 번호 ----->', data.id); // 방 번호 
            //console.log('채팅방 유저 ----->', data.no); // 회원 번호

            let roomNo = data.id;
            let userNo = data.no;

            let updateRoomTable =
            `
                UPDATE 
                    CHAT_ROOM 
                SET 
                    ROOM_PERSONNEL = ROOM_PERSONNEL - 1
                WHERE 
                    ROOM_NO = ?
            `;
            let deleteChatParticipant = 
            `
                DELETE FROM 
                    CHAT_PARTICIPANT
                WHERE 
                    ROOM_NO = ? 
                AND 
                    USER_NO = ?
            `;
            DB.query(deleteChatParticipant, [roomNo, userNo], (err, deleteResult) => {
                if(err) {

                    console.log('participant table delete fail -----> ', err);

                } else {

                    console.log('participant table delete success -----> ', deleteResult);

                    DB.query(updateRoomTable, [roomNo], (err, roomDataUpdateResult) => {
                        if(err) {

                            console.log('room table ROOM_PERSONNEL - 1 fail -----> ', err);                            
                            
                        } else {

                            console.log('room table ROOM_PERSONNEL - 1 success -----> ', roomDataUpdateResult);

                        }
                    });
                }
            });

            socket.leave(roomNo);
            socket.to(roomNo).emit('userLeft', { userNo, message: '방을 나갔습니다.' });
            socket.emit('leaveRoomResult', { success: true });

        });

        // 채팅방 즐겨 찾기
        socket.on('likeRoom', (data) => {
            console.log('채팅방 즐겨 찾기 이벤트 roomId -----> ', data.id);
            console.log('채팅방 즐겨 찾기 이벤트 userNo -----> ', data.no);

            let roomNo = data.id;
            let userNo = data.no;

            let chatRoomLikeSql =
            `
                UPDATE 
                    CHAT_PARTICIPANT 
                SET 
                    PARTI_BOOKMARK = CASE 
                                        WHEN PARTI_BOOKMARK = 1 THEN 0 
                                        ELSE 1 
                                    END 
                WHERE 
                    ROOM_NO = ? 
                AND 
                    USER_NO = ?
            `;

            DB.query(chatRoomLikeSql, [roomNo, userNo], (err, chatRoomLikeResult) => {
                if(err) {
                    console.log('채팅방 즐겨찾기 중 오류가 발생했습니다 -----> ', err);
                } else {
                    console.log('채팅방 즐겨찾기에 성공했습니다 -----> ', chatRoomLikeResult)
                }
            });

            socket.emit('chatLikeOkResult', {success: true});

        });

        // 채팅list 새로고침
        socket.on('request room list', (user) => { 
            console.log('리스트 새로 고침 socket 이벤트!');
            let userNo = user.userNo;

            let refreshSql = 
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
            `;

           DB.query(refreshSql, [userNo], (err, rooms) => {
                if(err) {

                    console.log('채팅방 새로고침 중 오류 발생 -----> ', err);

                } else {

                    console.log('리스트 새로 고침! -----> ', rooms);
                    socket.emit('update room list', rooms);

                }
            });
        });
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });
};