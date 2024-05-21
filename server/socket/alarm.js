const DB = require('../lib/db/db');
const userOnline = new Map();
const jwt = require('jsonwebtoken');

// module.exports = io;

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected>>>>>>>>>>>>');
       

        socket.on('register', (userId) => {
           
            userOnline.set(userId, socket.id);
            console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
            console.log('userOnline+++++++++++', userOnline)
        });
        
        socket.on('send_friend_request', (data) => {
            const { targetId, fromId, fromName } = data;
            console.log('소켓으로 요청내용 받음', {targetId, fromId, fromName});

            const targetSocketId = userOnline.get(targetId);
            if (targetSocketId) {
                console.log('상대방도 online상태')
                DB.query(`UPDATE REQ_FRIEND_ALARM SET RF_IS_READ = 1 WHERE FROM_USER = ? AND TARGET_ID = ?`, 
                [fromId, targetId], 
                (error, result) => {

                    if(result.affectedRows > 0) {
                        console.log('update REQ_FRIEND_ALARM is_read SUCCESS');
                    } else {
                        console.log('update REQ_FRIEND_ALARM is_read FAIL');
                    }
                })
                io.to(targetSocketId).emit('receive_notification', { fromId, fromName});
            } else {
                console.log('Target user is not connected');
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected>>>>>>>>>>>>>>');
            userOnline.forEach((value, key) => {
                if(value === socket.id) {
                    userOnline.delete(key);
                    console.log(`User removed from online list: ${key}`);
                }
            });
        });

    });
};