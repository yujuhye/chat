const db = require('../../lib/db/db');

exports.createMessage = async (messageData) => {
    const query = `
    INSERT INTO OPEN_CHAT (
      OPEN_R_NO,
      USER_NO,
      OPEN_P_NICKNAME,
      OPEN_C_TYPE,
      OPEN_C_TEXT,
      OPEN_C_IMAGE
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    const values = [
        messageData.OPEN_R_NO,
        messageData.USER_NO,
        messageData.OPEN_P_NICKNAME,
        messageData.OPEN_C_TYPE,
        messageData.OPEN_C_TEXT,
        messageData.OPEN_C_IMAGE,
    ];
    await db.query(query, values);
};

// openChatDao/getLatestMessage.js

exports.getLatestMessage = async (roomId) => {
    const query = `
    SELECT *
    FROM OPEN_CHAT
    WHERE OPEN_R_NO = ?
    ORDER BY OPEN_C_NO DESC
    LIMIT 1
  `;
    const [rows] = await db.query(query, [roomId]);
    return rows[0];
};