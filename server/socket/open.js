const {
    getOpenChatRoomsByUserNo, AllOpenChatRooms
} = require('./openChatDao/getOpenChatRoomsFromDatabase');


module.exports = (io) => {
    io.on('connection', (socket) => {

        console.log('connected for open chat');

        // 오픈 채팅방 리스트
        socket.on('getOpenChatList', async (userNo) => {
            try {
                const openChatRooms = getOpenChatRoomsByUserNo(userNo, (error, openChatRooms) => {
                    if (error) {
                        console.error('Failed to fetch open chat rooms:', error);
                    } else {
                        socket.emit('openChatRooms', openChatRooms);
                    }
                });
            } catch (error) {
                console.error('Failed to fetch open chat rooms:', error);
                socket.emit('openChatRoomsError', {
                    message: 'Failed to fetch open chat rooms'
                });
            }
        });

        // 모든 오픈채팅방리스트
        socket.on('getAllOpenChatRoom', async (userNo) => {

            try {
                AllOpenChatRooms(userNo, (error, openChatAllRooms) => {
                    if (error) {
                        console.error('Failed to fetch open chat rooms:', error);
                    } else {
                        socket.emit('openAllRooms', openChatAllRooms);
                    }
                });
                
            } catch (error) {
                console.log('all리스트에러', error);

            }



        });

        // 오픈 채팅방 입장 이벤트 처리
        socket.on('joinRoom', (roomId) => {
            // 해당 오픈 채팅방에 사용자 입장 처리
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        });

        // 오픈 채팅방 메시지 전송 이벤트 처리
        socket.on('message', (data) => {
            const {
                roomId,
                message
            } = data;
            // 해당 오픈 채팅방에 메시지 전송
            io.to(roomId).emit('message', message);
        });

        // 연결 해제 이벤트 처리
        socket.on('disconnect', () => {
            console.log('disconnected from open chat');
        });
    });
};