const DB = require('../lib/db/db');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

        // 채팅방 생성
        socket.on('createRoom', (roomInfo) => {

            let sql = 
            `
                INSERT INTO 
                CHAT_ROOM(ROOM_DEFAULT_NAME) 
                VALUES(?)
            `;
            DB.query(sql, [roomInfo.room_default_name], (err, result) => {

                if(err) {

                    console.log('create chat room error! ---> ', err);
                    socket.emit('chat room create fail', err.message);
                    return;

                }

                console.log('chat room create success!');

                // socket.emit : 메시지를 특정 클라이언트에게만 전송
                socket.emit('roomCreated', {id: result.insertId, name: roomInfo.room_default_name});
                io.emit('refresh room list')

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