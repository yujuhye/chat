const DB = require('../../lib/db/db');

exports.updateBookmark = async (rNo, uNo, callback) => {

    let query = `UPDATE OPEN_CHAT_PARTICIPANT
    SET OPEN_P_BOOKMARK = (CASE WHEN OPEN_P_BOOKMARK = 0 THEN 1 ELSE 0 END)
    WHERE OPEN_P_NO IN (
      SELECT OPEN_P_NO
      FROM OPEN_CHAT_PARTICIPANT
      WHERE rNo = ? AND uNo = ?
    )`

    DB.query(query, [rNo, uNo], (error, result) => {

        if(error) {
            callback(error, 0);
        } else {

            if(result.affectedRows > 0) {
                callback(error, result.affectedRows);
            } else {
                callback(error, 0);
            }

        }

    });

}