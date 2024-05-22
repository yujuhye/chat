const DB = require('../../lib/db/db');

exports.getOpenChatRoomsByUserNo = async (userNo, callback) => {

    const query = `
        SELECT 
    ocr.OPEN_R_NO,
    ocr.OPEN_R_ID,
    ocr.OPEN_R_NAME,
    ocr.OPEN_R_PROFILE,
    ocr.OPEN_R_ADMIN_NO,
    ocr.OPEN_R_LIMIT,
    ocr.OPEN_R_PERSONNEL,
    ocr.OPEN_R_INTRO,
    ocr.OPEN_R_ROLE,
    ocr.OPEN_R_REG_DATE,
    ocr.OPEN_R_MOD_DATE,
    ocp.OPEN_P_BOOKMARK,
    CASE
        WHEN oc.OPEN_C_TYPE = 0 THEN oc.OPEN_C_TEXT
        ELSE oc.OPEN_C_TYPE
    END AS LATEST_MESSAGE
FROM 
    OPEN_CHAT_ROOM ocr
    JOIN OPEN_CHAT_PARTICIPANT ocp ON ocr.OPEN_R_NO = ocp.OPEN_R_NO
    LEFT JOIN (
        SELECT 
            OPEN_R_NO,
            OPEN_C_TYPE,
            OPEN_C_TEXT,
            ROW_NUMBER() OVER (PARTITION BY OPEN_R_NO ORDER BY OPEN_C_REG_DATE DESC) AS RN
        FROM 
            OPEN_CHAT
    ) oc ON ocr.OPEN_R_NO = oc.OPEN_R_NO AND oc.RN = 1
WHERE 
    ocp.USER_NO = ?;
    `;

    DB.query(query, [userNo], (error, results) => {
        if (error) {
            console.error('Failed to fetch open chat rooms:', error);
            callback(error, null);
        } else {
            callback(null, results);
        }
    });

};


exports.AllOpenChatRooms = async (userNo, callback) => {

    const query = `SELECT 
    ocr.OPEN_R_NO,
    ocr.OPEN_R_ID,
    ocr.OPEN_R_NAME,
    ocr.OPEN_R_PROFILE,
    ocr.OPEN_R_ADMIN_NO,
    ocr.OPEN_R_LIMIT,
    ocr.OPEN_R_PERSONNEL,
    ocr.OPEN_R_INTRO,
    ocr.OPEN_R_ROLE,
    ocr.OPEN_R_REG_DATE,
    ocr.OPEN_R_MOD_DATE 
FROM 
    OPEN_CHAT_ROOM ocr 
WHERE 
    ocr.OPEN_R_NO NOT IN (
        SELECT OPEN_R_NO
        FROM OPEN_CHAT_PARTICIPANT
        WHERE USER_NO = ?
    );`

    DB.query(query, [userNo], (error, results) => {
        if (error) {
            console.log('error');
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
}