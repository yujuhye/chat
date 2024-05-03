const DB = require('../db/db');
const fs = require('fs');

const chatService = {
    details: (req, res) => {
        //let user = req.user;
        let user = '1';
        let query = req.query;
        let roomNo = query.roomId;

        console.log('[chatService] details.roomNo -----> ', roomNo);

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
                * 
            FROM 
                CHAT
            WHERE 
                ROOM_NO = ? 
            ORDER BY 
                CHAT_REG_DATE ASC
        `;

        // 첫 번째 쿼리 실행
        DB.query(userRoomsQuery, [user], (error, userRoomsResults) => {
            if (error) {
                console.error('DB query error:', error);
                res.status(500).send('Database query failed');
                return;
            }
            
            let userRooms = userRoomsResults;
            console.log('[chatService] userRooms -----> ', userRooms);
            
            // 다음 쿼리 실행 (roomDetailsQuery)
            DB.query(roomDetailsQuery, [roomNo], (error, roomDetailsResults) => {
                if (error) {
                    console.error('DB query error:', error);
                    res.status(500).send('Database query failed');
                    return;
                }
                let roomDetails = roomDetailsResults[0];
                console.log('[chatService] roomDetails -----> ', roomDetails);

                // 다음 쿼리 실행 (participantsQuery)
                DB.query(participantsQuery, [roomNo, user], (error, participantsResults) => {
                    if (error) {
                        console.error('DB query error:', error);
                        res.status(500).send('Database query failed');
                        return;
                    }

                    let participants = participantsResults;
                    console.log('[chatService] participants -----> ', participants);

                    // 다음 쿼리 실행 (chatHistoryQuery)
                    DB.query(chatHistoryQuery, [roomNo], (error, chatHistoryResults) => {
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

    },
    
};

module.exports = chatService;