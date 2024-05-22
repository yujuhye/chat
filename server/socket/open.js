const { getOpenChatRoomsByUserNo, AllOpenChatRooms } = require('./openChatDao/getOpenChatRoomsFromDatabase');
const { createChatRoom, createChatRoomOnDefault } = require('./openChatDao/createChatRooms');
const { updateBookmark } = require('./openChatDao/updateBookmark');

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

        socket.on('createOpenChat', async (form, ) => {

            try {
                createChatRoom(form, (error, result) => {
                    if(error) {
                        console.error('Failed to fetch create chat rooms:', error)
 
                    } else {
                        if(result[0] > 0) {
                            socket.emit('createSuccess', [result[1], result[2]]);

                        } else {
                            console.log('DB INSERT FAIL');
                        }
                    }
                });

            } catch (error) {
                console.log('채팅방생성 에러', error);
            }

        });

        socket.on('createOpenChatOnDefault', async (form) => {

            try {
                createChatRoomOnDefault(form, (error, result) => {
                    if(error) {
                        console.log('Failed to fetch create chat rooms:', error);
                    } else {
                        if(result[0] > 0) {
                            socket.emit('createSuccess', [result[1], result[2]]);
                        } else {
                            console.log('DB INSERT FAIL');
                        }
                    }
                });
            } catch (error) {
                console.log('채팅방생성 에러', error);
            }

        })

        socket.on('updateBookmark', async (rNo, uNo) => {

            try {
                updateBookmark(rNo, uNo, (error, result) => {

                    if(error) {
                        console.log('Failed to fetch updateBookmark:', error);
                    } else {
                        if(result > 0) {
                            console.log('resultupdate', result);
                            socket.emit('bookmarkUpdateSucceess', result);

                        } else {
                            console.log('DB INSERT FAIL');
                        }
                        
                    }

                });
            } catch (error) {
                console.log('update bookmark error', error);
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