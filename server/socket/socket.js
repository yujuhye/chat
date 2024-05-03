const DB = require('../lib/db/db');

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
            };// user

            console.log('roomInfo.userInfo.USER_NO -----> ', roomInfo.userInfo.USER_NO);
            console.log('roomInfo.userInfo.USER_NICKNAME -----> ', roomInfo.userInfo.USER_NICKNAME);

            console.log('roomInfo -----> ', roomInfo);
            console.log('roomInfo.participants -----> ', roomInfo.participants);
            console.log('roomPersonnel -----> ', roomPersonnel);
            console.log('userInfo -----> ', userInfo);

            let sql = 
            `
                INSERT INTO 
                CHAT_ROOM(ROOM_DEFAULT_NAME, ROOM_PERSONNEL) 
                VALUES(?, ?)
            `;
            DB.query(sql, [roomName, roomPersonnel], (err, result) => {

                if(err) {

                    console.log('create chat room error! ---> ', err);
                    socket.emit('chat room create fail', err.message);
                    return;

                }

                console.log('chat room create success!');

                const roomId = result.insertId;
                console.log('new chat room [roomId] : ', roomId);
                
                roomInfo.participants.unshift(userInfo); // PUSH에서 변경
                console.log('roomInfo.participants : ', roomInfo.participants);

                // 참여자 정보 채팅방에 추가
                roomInfo.participants.forEach(participant => { 
                    let sqlInsertParticipant = `
                        INSERT INTO CHAT_PARTICIPANT(ROOM_NO, USER_NO, USER_NICKNAME, PARTI_REG_DATE, PARTI_CUSTOMZING_NAME) 
                        VALUES(?, ?, ?, NOW(), 
                        (SELECT ROOM_DEFAULT_NAME FROM CHAT_ROOM WHERE ROOM_NO = ?)
                    )
                    `;

                    const userNo = participant.USER_NO;
                    const friendNickname = participant.FRIEND_TARGET_NAME;

                    console.log('userNo ---> ', userNo);
                    console.log('userNickname ---> ', friendNickname);
                    
                    DB.query(sqlInsertParticipant, [roomId, userNo, friendNickname, roomId], (err, participantResult) => {
                        if (err) {
                            // 참여자 추가 실패 처리
                            console.log('add participant error! --->', err);
                            return; // 일반적으로 에러 처리 로직 필요
                        }
                        
                        console.log('participant added successfully');
                    });
                });

                // 성공 메시지를 소켓을 통해 전송
                socket.emit('roomCreated', {id: roomId, name: roomName});
                // 모든 사용자에게 방 리스트 새로고침 요청
                io.emit('refresh room list');
            });
        });

        // 채팅방 새로고침
        socket.on('request room list', () => {

            DB.query(`SELECT * FROM CHAT_ROOM`, (err, rooms) => {

                if(err) {

                    throw err;

                }

                socket.emit('update room list', rooms);

            });

        });

        // 친구 초대
        socket.on('invite room', function(data){

            let sql = `INSERT INTO CHAT_ROOM() VALUES()`;
            DB.query(sql, (err, result) => {

                if(err) {

                    throw err;

                }

                socket.emit('load old msgs', result);

            });

        });

        // 방 입장
        socket.on('joinRoom', async (roomId) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
            
            // 데이터베이스에서 해당 방의 기존 메시지들을 불러옵니다.
            const messages = await fetchMessagesFromDatabase(roomId);
            
            // 방금 입장한 사용자에게만 기존 메시지들을 전송합니다.
            socket.emit('loadOldMessages', messages);
            
            // 해당 방의 다른 사용자들에게 새로운 사용자의 입장을 알립니다.
            socket.to(roomId).emit('userJoined', {user: '새로운 사용자', message: '입장했습니다.'});
        });
        
        // 채팅방 떠남
        socket.on('leave room', function(data){

            socket.leave(data.roonName);
            io.to(data.roomName).emit('user left', {userName: data.username, roomName: data.roomName});

        });

        // chat msg
        socket.on('chat messge', (msg) => {
            let sql = `INSERT INTO CHAT()`;
            DB.query(sql, (err, msg) => {

            });
        })
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });
};