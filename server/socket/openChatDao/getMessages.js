const db = require('../../lib/db/db');

exports.getPreviousMessages = async (roomId, limit) => {
    const query = `
    SELECT *
    FROM OPEN_CHAT
    WHERE OPEN_R_NO = ?
    ORDER BY OPEN_C_NO DESC
    LIMIT ?
  `;
    const [rows] = await db.query(query, [roomId, limit]);
    return rows;
};

exports.loadMoreMessages = async (roomId, lastMessageId, limit) => {
    const query = `
    SELECT *
    FROM OPEN_CHAT
    WHERE OPEN_R_NO = ? AND OPEN_C_NO < ?
    ORDER BY OPEN_C_NO DESC
    LIMIT ?
  `;
    const [rows] = await db.query(query, [roomId, lastMessageId, limit]);
    return rows;
};