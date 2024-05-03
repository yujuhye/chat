const DB = require('../db/db');
const fs = require('fs');

const friendService = {

    friendList: (req, res) => {
        
        // let query = req.query;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`, 
        [req.user], 
        (error, no) => {

            if(no !== null && no.length > 0) {
                DB.query(`SELECT F.*, U.USER_CUR_MSG, U.USER_FRONT_IMG_NAME 
                            FROM FRIEND F JOIN USER_IFM U ON F.FRIEND_TARGET_ID = U.USER_ID 
                            WHERE F.USER_NO = ? AND F.FRIEND_IS_BLOCK = 0`, 
                [no[0].USER_NO] ,
                (error, friends) => {

                    if(friends !== null && friends.length > 0) {
                         res.json(friends);
                    } else {
                        res.json(null);
                    }

                })
            } else {
                res.json(null);
            }
        })

    },
    myProfile: (req, res) => {

        // let query = req.query;

        DB.query(`SELECT * FROM USER_IFM WHERE USER_ID = ? `, 
        [req.user], 
        (error, user) => {

            if(user !== null && user.length > 0) {

                res.json(user);

            } else {
                res.json(null);
            }

        })

    },
    searchFriendById: (req, res) => {

        let query = req.query;

        DB.query(`SELECT * FROM USER_IFM WHERE USER_ID LIKE CONCAT('%', ? , '%') `, 
        [query.uId], 
        (error, user) => {

            if(error) {
                res.json(null);
            }

            if(user !== null && user.length > 0) {
                res.json(user);

            } else {
                res.json(null);
            }

        })

    },
    matchingFriend: (req, res) => {

        let query = req.query;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`, 
        [req.user], 
        (error, no) => {
            if(no !== null && no.length > 0) {

                DB.query(`SELECT * FROM FRIEND WHERE USER_NO = ? AND FRIEND_TARGET_ID = ?`, 
                [no[0].USER_NO, query.friendId] ,
                (error, friend) => {

                    if(friend !== null && friend.length > 0) {
                        
                         res.json(friend);
                    } else {
                        res.json(null);
                    }

                })
            } else {
                res.json(null);
            }
        })

    },
    requestFriend: (req, res) => {

        let post = req.body;

        DB.query(`SELECT USER_NO, USER_NICKNAME FROM USER_IFM WHERE USER_ID = ?`, 
        [req.user], 
        (error, results) => {

            if(results !== null && results.length > 0){

                DB.query(`INSERT INTO REQUEST_FRIEND(USER_NO, USER_ID, USER_NICKNAME, REQUEST_TARGET_ID, REQUEST_TARGET_NAME, REQUEST_MESSAGE)
                VALUES(?, ?, ?, ?, ?, ?)`, 
                [results[0].USER_NO, req.user, results[0].USER_NICKNAME, post.friendId, post.friendName, post.reqMessage], 
                (error, result) => {

                    if(error) {
                        res.json(null);

                    } else {
                        res.json(result.affectedRows)
                    }

                })

            }

        })
    },
    matchingRequestFriend: (req, res) => {

        let query = req.query;

        DB.query(`SELECT * FROM REQUEST_FRIEND WHERE USER_ID = ? AND REQUEST_TARGET_ID = ? AND REQUEST_STATUS = 0`, 
        [req.user, query.friendId], 
        (error, reqStatusFriend) => {

            if(reqStatusFriend !== null && reqStatusFriend.length > 0) {
                res.json(reqStatusFriend);
            } else {
                res.json(null);
            }

        })

    },
    deleteRequestFriend: (req, res) => {

        let query = req.query;
        console.log('query' , query)

        DB.query(`DELETE FROM REQUEST_FRIEND WHERE USER_ID = ? AND REQUEST_TARGET_ID = ? AND REQUEST_STATUS = 0`, 
        [req.user, query.requestingFriendId], 
        (error, result) => {

            if(error) {
                res.json(null);

            } else {
                res.json(result.affectedRows);
            }

        })
    },
    getReceivedRequestFriend: (req, res) => {

        DB.query(`SELECT * FROM REQUEST_FRIEND WHERE REQUEST_TARGET_ID = ? AND REQUEST_STATUS = 0` , 
        [req.user] ,
        (error, getReqFriends) => {

            if(getReqFriends !== null && getReqFriends.length > 0) {
                res.json(getReqFriends);

            } else {
                res.json(null);
            }

        })

    },
    acceptRequestFriend: (req, res) => {

        let query = req.query;

        DB.query(`UPDATE REQUEST_FRIEND SET REQUEST_STATUS = 1, REQUEST_MOD_DATE = NOW() WHERE USER_ID = ? AND REQUEST_TARGET_ID = ?`, 
        [query.acceptReqfriendId, req.user], 
        (error, result) => {
            console.log('result: ', result)

            if(result.affectedRows > 0) {
                DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`, 
                [req.user], 
                (error, no) => {

                    if(no !== null && no.length > 0) {
                        DB.query(`INSERT INTO FRIEND(USER_NO, FRIEND_TARGET_NAME, FRIEND_TARGET_ID)
                        VALUES(?, ?, ?) `,
                        [no[0].USER_NO, query.acceptReqfriendName, query.acceptReqfriendId], 
                        (error, result) => {

                            if(result.affectedRows > 0) {
                                res.json(result. affectedRows);
                            } else {
                                res.json(null);
                            }

                        })
                    } else {
                        res.json(null);
                    }

                })
            } else {
                res.json(null);
            }
        })

    },
    acceptReqTargetFriend: (req, res) => {

        let post = req.body;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`, 
        [post.acceptReqfriendId], 
        (error, no) => {

            if(no !== null && no.length > 0) {

                DB.query(`SELECT USER_NICKNAME FROM USER_IFM WHERE USER_ID = ?`, 
                [req.user], 
                (error, name) => {

                    if(name !== null && name.length > 0) {
                        DB.query(`INSERT INTO FRIEND(USER_NO, FRIEND_TARGET_NAME, FRIEND_TARGET_ID)
                        VALUES(?, ?, ?)`, 
                        [no[0].USER_NO, name[0].USER_NICKNAME, req.user], 
                        (error, result) => {

                            if(result.affectedRows > 0) {
                                res.json(result.affectedRows);
                            } else {
                                res.json(null);
                            }
                        })

                    } else {
                        res.json(null);
                    }

                })

            } else {
                res.json(null);
            }

        })

    },
    getSentRequestFriend: (req, res) => {
    
        DB.query(`SELECT * FROM REQUEST_FRIEND WHERE USER_ID = ? AND REQUEST_STATUS = 0`, 
        [req.user], 
        (error, sentReqFriends) => {
            if(error) {
                res.json(null);
            }

            if(sentReqFriends !== null && sentReqFriends.length > 0) {
                res.json(sentReqFriends);
            } else {
                res.json(null);
            }
        })

    },
    deletesentReqFriend: (req, res) => {

        let query = req.query;

        DB.query(`DELETE FROM REQUEST_FRIEND WHERE USER_ID = ? AND REQUEST_TARGET_ID = ? AND REQUEST_STATUS = 0`, 
        [req.user, query.sentReqFriendId], 
        (error, result) => {

            if(result.affectedRows > 0) {
                res.json(result.affectedRows);

            }  else {
                res.json(null);
            }

        })
    }

    

}

module.exports = friendService;