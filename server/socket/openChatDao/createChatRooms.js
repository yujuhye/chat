const DB = require('../../lib/db/db');

exports.createChatRoom = async (form, callback) => {
    const insertOpenChatRoomQuery = `
    INSERT INTO OPEN_CHAT_ROOM (
      OPEN_R_ID,
      OPEN_R_NAME,
      OPEN_R_PROFILE,
      OPEN_R_ADMIN_NO,
      OPEN_R_LIMIT,
      OPEN_R_INTRO
    )
    VALUES (?, ?, ?, ?, ?, ?);
  `;
    const insertOpenChatRoomValues = [
        form.OPEN_R_ID,
        form.OPEN_R_NAME,
        form.OPEN_R_PROFILE,
        form.OPEN_R_ADMIN_NO,
        form.OPEN_R_LIMIT,
        form.OPEN_R_INTRO,
    ];

    DB.query(insertOpenChatRoomQuery, insertOpenChatRoomValues, (error, result1) => {
        if (error) {
            callback(error, null);
        } else {
            if (result1.affectedRows > 0) {
                const insertOpenChatParticipantQuery = `
          INSERT INTO OPEN_CHAT_PARTICIPANT (
            OPEN_R_NO,
            USER_NO,
            OPEN_P_NICKNAME,
            OPEN_P_PROFILE
          )
          VALUES (?, ?, ?, ?);
        `;
                const insertOpenChatParticipantValues = [
                    result1.insertId,
                    form.OPEN_R_ADMIN_NO,
                    form.OPEN_P_NICKNAME,
                    form.OPEN_P_PROFILE,
                ];

                DB.query(insertOpenChatParticipantQuery, insertOpenChatParticipantValues, (error, result2) => {
                    if (error) {
                        callback(error, null);
                    } else {
                        console.log('result1Id', result1.insertId);
                        callback(null, [result2.affectedRows, result1.insertId, form.OPEN_R_ADMIN_NO]);
                    }
                });
            } else {
                callback(null, 0);
            }
        }
    });
};

exports.createChatRoomOnDefault = async (form, callback) => {

    const insertOpenChatRoomQuery = `
      INSERT INTO OPEN_CHAT_ROOM (
        OPEN_R_ID,
        OPEN_R_NAME,
        OPEN_R_PROFILE,
        OPEN_R_ADMIN_NO,
        OPEN_R_LIMIT,
        OPEN_R_INTRO
      )
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const insertOpenChatRoomValues = [
        form.OPEN_R_ID,
        form.OPEN_R_NAME,
        form.OPEN_R_PROFILE,
        form.OPEN_R_ADMIN_NO,
        form.OPEN_R_LIMIT,
        form.OPEN_R_INTRO,
    ];

    DB.query(insertOpenChatRoomQuery, insertOpenChatRoomValues, (error, result1) => {

        if (error) {
            callback(error, null);
        } else {
            if (result1.affectedRows > 0) {

                DB.query(`SELECT * FROM USER_IFM WHERE USER_NO = ?`, [form.OPEN_R_ADMIN_NO], (error, user) => {

                    if (error) {
                        callback(error, null);
                    } else {
                        console.log(user);
                        if (user.length > 0) {

                            const insertOpenChatParticipantQuery = `
                                INSERT INTO OPEN_CHAT_PARTICIPANT (
                                    OPEN_R_NO,
                                    USER_NO,
                                    OPEN_P_NICKNAME,
                                    OPEN_P_PROFILE
                                )
                                VALUES (?, ?, ?, ?);
                                `;
                            const insertOpenChatParticipantValues = [
                                result1.insertId,
                                form.OPEN_R_ADMIN_NO,
                                user[0].USER_NICKNAME,
                                user[0].USER_FRONT_IMG_NAME,
                            ];

                            DB.query(insertOpenChatParticipantQuery, insertOpenChatParticipantValues, (error, result2) => {
                                if (error) {
                                    callback(error, null); 
                                } else {
                                    console.log('result1Id', result1.insertId);
                                    callback(null, [result2.affectedRows, result1.insertId, form.OPEN_R_ADMIN_NO]); 
                                }
                            }); 

                        } else {
                            callback(error, null); 
                        }
                    }
                }); 

            } else {
                callback(null, 0); 
            }
        }
    });
};