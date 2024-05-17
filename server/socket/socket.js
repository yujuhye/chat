const DB = require('../lib/db/db');

async function fetchMessagesFromDatabase(roomId, userNo) {
    console.log('[socket] fetchMessagesFromDatabase roomId -----> ', roomId);
    console.log('[socket] fetchMessagesFromDatabase userNo -----> ', userNo);

    return new Promise((resolve, reject) => {
        const chatDataSql = 
        `
        SELECT 
            C.* 
        FROM 
            CHAT AS C
        JOIN 
            CHAT_PARTICIPANT AS CP ON C.ROOM_NO = CP.ROOM_NO
        WHERE 
            C.ROOM_NO = ?
            AND CP.USER_NO = ?
            AND C.CHAT_REG_DATE > CP.PARTI_REG_DATE
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
        console.log('A user connected');

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
        socket.on('invite room', function(data){
            const selectedFriends = data.selectedFriends; // 초대된 친구들의 정보
            const roomId = data.roomId;
            const participants = data.participants;
        
            //console.log('친구 초대 roomId -----> ', roomId);
            //console.log('친구 초대 selectedFriends -----> ', selectedFriends);
            //console.log('친구 초대 data -----> ', data);
        
            // 현 방의 현재 참여자 수를 조회합니다.
            let sqlSelect = `SELECT ROOM_PERSONNEL, ROOM_DEFAULT_NAME FROM CHAT_ROOM WHERE ROOM_NO = ?`;
            DB.query(sqlSelect, [roomId], (err, result) => {
                if(err) {
                    throw err;
                }
        
                const currentPersonnel = result[0].ROOM_PERSONNEL;
                const roomDefaultName = result[0].ROOM_DEFAULT_NAME; // 채팅방 기본 이름 조회
                const newPersonnel = currentPersonnel + selectedFriends.length;
        
                // 참여자 수를 업데이트합니다.
                let sqlUpdate = `UPDATE CHAT_ROOM SET ROOM_PERSONNEL = ? WHERE ROOM_NO = ?`;
                DB.query(sqlUpdate, [newPersonnel, roomId], (err, updateResult) => {
                    if(err) {
                        throw err;
                    }
        
                    // 초대된 각 친구별로 CHAT_PARTICIPANT 테이블에 데이터를 삽입합니다.
                    selectedFriends.forEach(friendNo => {
                        //console.log('추가하는 친구 번호 -----> ', friendNo);
                        // participants 배열에서 해당 친구 번호에 맞는 친구 정보 찾기
                        const friend = participants.find(participant => participant.FRIEND_NO === friendNo);
                        if (friend) {
                            let sqlInsert = `INSERT INTO CHAT_PARTICIPANT (ROOM_NO, USER_NO, USER_NICKNAME, PARTI_CUSTOMZING_NAME, PARTI_REG_DATE) VALUES (?, ?, ?, ?, NOW())`;
                            // friend 객체에서 필요한 정보와 채팅방 이름을 추출하여 DB 쿼리 실행
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
                    socket.emit('load old msgs', updateResult);
                });
            });
        });        
        
        // 방 입장
        socket.on('joinRoom', async (roomId,userNo) => {
            socket.join(roomId);
            console.log('★★입장★★');
            console.log(`User joined room: ${roomId}`);
            console.log(`User joined user: ${userNo}`);
            
            // 데이터베이스에서 해당 방의 기존 메시지들을 불러옵니다.
            const messages = await fetchMessagesFromDatabase(roomId, userNo);
            
            // 방금 입장한 사용자에게만 기존 메시지들을 전송합니다.
            socket.emit('loadOldMessages', messages);
            
            // 해당 방의 다른 사용자들에게 새로운 사용자의 입장을 알립니다.
            socket.to(roomId).emit('userJoined', {user: '새로운 사용자', message: '입장했습니다.'});

        });

        // 파일 전송 후 방에 참여한 사람들에게 바로 보이게 하기
        socket.on('submitFile', async (data) => {      
            const messages = await fetchMessagesFromDatabase(data.roomId, data.userNo);
        
            // 마지막 메시지를 가져오기
            const lastMessage = messages[messages.length - 1];
        
            // 마지막 메시지에 fileName 추가
            let updatedMessages = { ...lastMessage};
        
            let chatInfo = {
                // userId: data.userId,
                // fileName: data.fileName,
                // fileUrl: data.fileUrl,
                messages: updatedMessages,
            }
        
            console.log('File file************* -----> ', chatInfo);
        
            // 방에 있는 모든 사용자에게 파일 정보와 추가 정보 전송
            socket.to(data.roomId).emit('receiveFile', chatInfo);
        });          

        // 읽음 처리
        socket.on('updateReadCnt', async (roomId, userInfos) => {
            console.log('읽음 처리 >>>>> roomId -----> ', roomId);
            console.log('읽음 처리 >>>>> userInfos -----> ', userInfos);

            
        });

        // 메시지 전송
        socket.on('sendMessage', (data) => {
            const { sender, content, roomId, userNo } = data;
        
            console.log('sender -----> ', data.sender);
            console.log('userNo -----> ', data.userNo);
        
            const now = new Date();
            now.setHours(now.getHours() + 9); // KST 시간으로 조정
            const kst = now.toISOString().slice(0, 19).replace('T', ' ');
        
            let sql = `INSERT INTO CHAT(ROOM_NO, USER_NICKNAME, CHAT_CONDITION, CHAT_TEXT, CHAT_REG_DATE) VALUES(?, ?, 0, ?, ?)`;
        
            DB.query(sql, [roomId, sender, content, kst], (err, result) => {
                if (err) {
                    console.error('Error inserting message into database', err);
                    return;
                }

                console.log('메시지 전송 성공!!!!! -----> ', result);

                let sql = `SELECT USER_NO FROM CHAT_PARTICIPANT WHERE ROOM_NO = ?`;
                DB.query(sql, [roomId], (err, users) => {
                    if (err) {
                        console.error('오류오류!!! -----> ', err);
                        return;
                    }
        
                    let usersInRoom = users.map(user => user.USER_NO);
        
                    usersInRoom.forEach(user => {
                        let readStatus = user === userNo ? 1 : 0; // userNo를 사용하여 비교
                        console.log('읽음 읽지 않음 처리 -----> user : ', user);
                        console.log('읽음 읽지 않음 처리 -----> senderUserNo : ', userNo); // 로그 수정
                        let sql = `INSERT INTO CHAT_READ_STATUS(CHAT_NO, USER_NO, READ_STATUS) VALUES(?, ?, ?)`;
                        DB.query(sql, [result.insertId, user, readStatus], (err, insertResult) => {
                            if (err) {
                                console.error('CHAT_READ_STATUS 업데이트 오류 발생 -----> ', err);
                                return;
                            }
                            console.log('CHAT_READ_STATUS 업데이트 성공 -----> ', insertResult);
                        });
                    });
        
                    // 메시지를 보낸 후 읽지 않은 사용자의 수를 계산
                    let unreadCountSql = `SELECT COUNT(USER_NO) AS UNREAD_COUNT FROM CHAT_READ_STATUS WHERE READ_STATUS = 0 AND CHAT_NO = ? AND USER_NO != ?`;
                    DB.query(unreadCountSql, [result.insertId, userNo], (err, unreadResult) => { // userNo를 사용하여 업데이트
                        if (err) {
                            console.error('UNREAD_COUNT 쿼리 오류 발생 -----> ', err);
                            return;
                        }
                        console.log('UNREAD_COUNT 쿼리 실행 성공 -----> ', unreadResult);
        
                        const messageToSend = {
                            sender: sender,
                            content: content,
                            sentAt: kst,
                            status: 0,
                            readStatus: false,
                            unreadCount: unreadResult[0].UNREAD_COUNT, // 읽지 않은 사용자의 수를 추가
                        };
        
                        io.to(roomId).emit('receiveMessage', messageToSend);
                    });
                });
            });
        });           
        
        // 채팅방 떠남
        socket.on('leaveRoom', function(data){
            //console.log('채팅방 떠남 ----->', data); // 방 번호 & 회원 번호
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
            socket.to(roomNo).emit('userLeft', { userNo, message: 'A user has left the room.' });
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

                    console.log('update room list -----> ', rooms);
                    socket.emit('update room list', rooms);

                }
            });
        });
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });
};