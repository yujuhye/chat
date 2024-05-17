const DB = require('../db/db');
const fs = require('fs');

const friendService = {

    friendList: (req, res) => {

        console.log('req.user ---> ', req.user);
        // let query = req.query;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [req.user.USER_ID],
            (error, no) => {

                if (no !== null && no.length > 0) {
                    console.log('no[0] ---> ', no[0])
                    DB.query(`SELECT F.*, U.USER_CUR_MSG, U.USER_FRONT_IMG_NAME, U.USER_BACK_IMG_NAME 
                            FROM FRIEND F JOIN USER_IFM U ON F.FRIEND_TARGET_ID = U.USER_ID 
                            WHERE F.USER_NO = ? AND F.FRIEND_IS_BLOCK = 0
                            ORDER BY U.USER_NICKNAME ASC`,
                        [no[0].USER_NO],
                        (error, friends) => {

                            if (friends !== null && friends.length > 0) {
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

                if (user !== null && user.length > 0) {

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

                if (error) {
                    res.json(null);
                }

                if (user !== null && user.length > 0) {
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
                if (no !== null && no.length > 0) {

                    DB.query(`SELECT * FROM FRIEND WHERE USER_NO = ? AND FRIEND_TARGET_ID = ?`,
                        [no[0].USER_NO, query.friendId],
                        (error, friend) => {

                            if (friend !== null && friend.length > 0) {

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

                if (results !== null && results.length > 0) {

                    DB.query(`INSERT INTO REQUEST_FRIEND(USER_NO, USER_ID, USER_NICKNAME, REQUEST_TARGET_ID, REQUEST_TARGET_NAME, REQUEST_MESSAGE)
                VALUES(?, ?, ?, ?, ?, ?)`,
                        [results[0].USER_NO, req.user, results[0].USER_NICKNAME, post.friendId, post.friendName, post.reqMessage],
                        (error, result) => {

                            if (error) {
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

                if (reqStatusFriend !== null && reqStatusFriend.length > 0) {
                    res.json(reqStatusFriend);
                } else {
                    res.json(null);
                }

            })

    },
    deleteRequestFriend: (req, res) => {

        let query = req.query;
        console.log('query', query)

        DB.query(`DELETE FROM REQUEST_FRIEND WHERE USER_ID = ? AND REQUEST_TARGET_ID = ? AND REQUEST_STATUS = 0`,
            [req.user, query.requestingFriendId],
            (error, result) => {

                if (error) {
                    res.json(null);

                } else {
                    res.json(result.affectedRows);
                }

            })
    },
    getReceivedRequestFriend: (req, res) => {

        const query = `
        SELECT 
        rf.REQUEST_NO, rf.USER_ID, rf.USER_NICKNAME, rf.REQUEST_MESSAGE, 
            uif.USER_FRONT_IMG_NAME
        FROM 
            REQUEST_FRIEND rf
        JOIN 
            USER_IFM uif ON rf.USER_ID = uif.USER_ID
        WHERE 
            rf.REQUEST_TARGET_ID = ? AND rf.REQUEST_STATUS = 0
        ORDER BY
            rf.REQUEST_REG_DATE DESC
        `;

        DB.query(query, [req.user],
            (error, getReqFriends) => {

                if (getReqFriends !== null && getReqFriends.length > 0) {

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

                if (result.affectedRows > 0) {
                    DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
                        [req.user],
                        (error, no) => {

                            if (no !== null && no.length > 0) {
                                DB.query(`INSERT INTO FRIEND(USER_NO, FRIEND_TARGET_NAME, FRIEND_TARGET_ID)
                        VALUES(?, ?, ?) `,
                                    [no[0].USER_NO, query.acceptReqfriendName, query.acceptReqfriendId],
                                    (error, result) => {

                                        if (result.affectedRows > 0) {
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
    acceptReqTargetFriend: (req, res) => {

        let post = req.body;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [post.acceptReqfriendId],
            (error, no) => {

                if (no !== null && no.length > 0) {

                    DB.query(`SELECT USER_NICKNAME FROM USER_IFM WHERE USER_ID = ?`,
                        [req.user],
                        (error, name) => {

                            if (name !== null && name.length > 0) {
                                DB.query(`INSERT INTO FRIEND(USER_NO, FRIEND_TARGET_NAME, FRIEND_TARGET_ID)
                        VALUES(?, ?, ?)`,
                                    [no[0].USER_NO, name[0].USER_NICKNAME, req.user],
                                    (error, result) => {

                                        if (result.affectedRows > 0) {
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

        const query = `
        SELECT 
            rf.REQUEST_NO, rf.REQUEST_TARGET_ID, rf.REQUEST_TARGET_NAME, 
            uif.USER_FRONT_IMG_NAME
        FROM 
            REQUEST_FRIEND rf
        JOIN 
            USER_IFM uif ON rf.REQUEST_TARGET_ID = uif.USER_ID
        WHERE 
            rf.USER_ID = ? AND (rf.REQUEST_STATUS = 0 OR rf.REQUEST_STATUS = 2)
        ORDER BY
            rf.REQUEST_REG_DATE DESC
        `;

        DB.query(query, [req.user],
            (error, sentReqFriends) => {
                if (error) {
                    res.json(null);
                }

                if (sentReqFriends !== null && sentReqFriends.length > 0) {
                    res.json(sentReqFriends);
                } else {
                    res.json(null);
                }
            })

    },
    deletesentReqFriend: (req, res) => {

        let query = req.query;

        DB.query(`DELETE FROM REQUEST_FRIEND WHERE REQUEST_NO = ?`,
            [query.reqNo],
            (error, result) => {

                if (result.affectedRows > 0) {
                    res.json(result.affectedRows);

                } else {
                    res.json(null);
                }

            })
    },
    blockFriend: (req, res) => {

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [req.user],
            (error, no) => {

                if (no !== null && no.length > 0) {

                    const query = `
                    SELECT 
                        F.*, U.USER_FRONT_IMG_NAME
                    FROM 
                        FRIEND F
                    JOIN
                        USER_IFM U ON F.FRIEND_TARGET_ID = U.USER_ID
                    WHERE 
                        F.USER_NO = ? AND F.FRIEND_IS_BLOCK = 1
                    ORDER BY 
                        F.FRIEND_BLOCK_DATE DESC

                `

                    DB.query(query, [no[0].USER_NO],
                        (error, blockFriend) => {

                            if (blockFriend !== null && blockFriend.length > 0) {
                                res.json(blockFriend);
                            } else {
                                res.json(null);
                            }

                        })

                } else {
                    res.json(null);
                }

            })

    },
    releaseBlockFriend: (req, res) => {

        // DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`, 
        // [req.user], 
        // (error, no) => {

        //     if(no !== null && no.length > 0) {

        //         DB.query(`UPDATE FRIEND SET FRIEND_IS_BLOCK = 0 WHERE USER_NO = ?`,
        //         [no[0].USER_NO], 
        //         (error, result) => {

        //             if(result.affectedRows > 0) {
        //                 res.json(result.affectedRows);
        //             } else {
        //                 res.json(null);
        //             }

        //         })

        //     } else {
        //         res.json(null);
        //     }

        // })
        let query = req.query;

        DB.query(`UPDATE FRIEND SET FRIEND_IS_BLOCK = 0 WHERE FRIEND_NO = ?`,
            [query.friendNo],
            (error, result) => {

                if (result.affectedRows > 0) {
                    res.json(result.affectedRows);
                } else {
                    res.json(null);
                }

            })

    },
    hideRequestFriend: (req, res) => {

        let query = req.query;

        DB.query(`UPDATE REQUEST_FRIEND SET REQUEST_STATUS = 2 WHERE USER_ID = ? AND REQUEST_TARGET_ID = ?`,
            [query.reqId, req.user],
            (error, result) => {

                if (result.affectedRows > 0) {

                    res.json(result.affectedRows);

                } else {

                    res.json(null);
                }

            })
    },
    matchingReceivedReqFriend: (req, res) => {

        let query = req.query;

        DB.query(`SELECT * FROM REQUEST_FRIEND WHERE USER_ID = ? AND REQUEST_TARGET_ID = ? AND REQUEST_STATUS = 0`,
            [query.friendId, req.user],
            (error, recFriend) => {

                if (recFriend !== null && recFriend.length > 0) {
                    res.json(recFriend);
                } else {
                    res.json(null);
                }

            })
    },
    myProfileEdit: (req, res) => {

        let post = req.body;

        let sql = `UPDATE USER_IFM SET USER_NICKNAME = ?, USER_MOD_DATE = NOW()`;
        let params = [post.profileName]

        if (req.files['profileBackImg'] && req.files['uFrontImgName']) {

            const uFrontImgFileName = req.files['uFrontImgName'][0].filename;
            const profileBackImgName = req.files['profileBackImg'][0].filename;
            sql += `, USER_FRONT_IMG_NAME = ?, USER_BACK_IMG_NAME = ?`
            params.push(uFrontImgFileName, profileBackImgName);

        } else if (req.files['profileBackImg']) {

            const profileBackImgName = req.files['profileBackImg'][0].filename;
            sql += `, USER_BACK_IMG_NAME = ?`
            params.push(profileBackImgName);

        } else if (req.files['uFrontImgName']) {

            const uFrontImgFileName = req.files['uFrontImgName'][0].filename;
            sql += `, USER_FRONT_IMG_NAME = ?`
            params.push(uFrontImgFileName);
        }

        if (post.profilMessage) {
            console.log('message')

            sql += `, USER_CUR_MSG = ?`
            params.push(post.profilMessage);
        }

        sql += `WHERE USER_ID = ?`
        params.push(req.user);

        DB.query(sql, params,
            (error, result) => {
                let sql = `INSERT INTO PROFILE_IMG(USER_NO, PROFILE_NAME, PROFILE_DIVIDE) VALUES(?, ?, ?)`
                let param = [];
                let action = [];

                if (result.affectedRows > 0) {
                    if (post.uFrontImgName === 'undefined' && post.profileBackImg === 'undefined') {
                        res.json(result.affectedRows);
                    } else {

                        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
                            [req.user],
                            (error, no) => {

                                if (no !== null && no.length > 0) {
                                    const userNO = no[0].USER_NO;

                                    if (req.files['profileBackImg'] && req.files['uFrontImgName']) {
                                        console.log('사진 둘다 있음')
                                        const uFrontImgFileName = req.files['uFrontImgName'][0].filename;
                                        const profileBackImgName = req.files['profileBackImg'][0].filename;
                                        DB.query(sql, [userNO, uFrontImgFileName, 0],
                                            (error, result) => {

                                                if (result.affectedRows > 0) {

                                                    DB.query(sql, [userNO, profileBackImgName, 1],
                                                        (error, result) => {
                                                            if (result.affectedRows > 0) {
                                                                return res.json(result.affectedRows);
                                                            } else {
                                                                return res.json(null);
                                                            }
                                                        })
                                                } else {
                                                    return res.json(null);
                                                }
                                            })

                                    } else if (req.files['profileBackImg']) {
                                        const profileBackImgName = req.files['profileBackImg'][0].filename;
                                        param.push(userNO, profileBackImgName, 1);
                                        action.push('front');

                                    } else if (req.files['uFrontImgName']) {
                                        const uFrontImgFileName = req.files['uFrontImgName'][0].filename;
                                        param.push(userNO, uFrontImgFileName, 0);
                                        action.push('back');
                                    }

                                    if (action.length > 0) {
                                        DB.query(sql, param,
                                            (error, result) => {
                                                if (result.affectedRows > 0) {
                                                    res.json(result.affectedRows);
                                                } else {
                                                    res.json(null);
                                                }
                                            })

                                    }

                                } else {
                                    res.json(null);
                                }
                            })
                    }

                } else {
                    res.json(null);
                }
            })

    },
    myBackDefaultImg: (req, res) => {

        DB.query(`UPDATE USER_IFM SET USER_BACK_IMG_NAME = '' WHERE USER_ID = ?`,
            [req.user],
            (error, result) => {

                if (result.affectedRows > 0) {
                    res.json(result.affectedRows);
                } else {
                    res.json(null);
                }

            })
    },
    myFrontDefaultImg: (req, res) => {

        DB.query(`UPDATE USER_IFM SET USER_FRONT_IMG_NAME = '' WHERE USER_ID = ?`,
            [req.user],
            (error, result) => {

                if (result.affectedRows > 0) {
                    res.json(result.affectedRows);
                } else {
                    res.json(null);
                }

            })

    },
    updateblockFriend: (req, res) => {

        let query = req.query;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [req.user],
            (error, no) => {

                if (no !== null && no.length > 0) {

                    DB.query(`UPDATE FRIEND SET FRIEND_IS_BLOCK = 1, FRIEND_BLOCK_DATE = NOW() 
                          WHERE USER_NO = ? AND FRIEND_TARGET_ID = ?`,
                        [no[0].USER_NO, query.friendId],
                        (error, result) => {

                            if (result.affectedRows > 0) {
                                res.json(result.affectedRows);
                            } else {
                                res.json(null);
                            }
                        })

                } else {
                    res.json(null);
                }

            })

    },
    deleteFriend: (req, res) => {

        let query = req.query;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [req.user],
            (error, no) => {

                if (no !== null && no.length > 0) {

                    DB.query(`DELETE FROM FRIEND WHERE USER_NO = ? AND FRIEND_TARGET_ID = ?`,
                        [no[0].USER_NO, query.friendId],
                        (error, result) => {

                            if (result.affectedRows > 0) {
                                res.json(result.affectedRows);
                            } else {
                                res.json(null);
                            }
                        })

                } else {
                    res.json(null);
                }

            })

    },
    deleteTargetFriend: (req, res) => {

        let query = req.query;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [query.friendId],
            (error, targetNo) => {

                if (targetNo !== null && targetNo.length > 0) {
                    DB.query(`DELETE FROM FRIEND WHERE USER_NO = ? AND FRIEND_TARGET_ID = ?`,
                        [targetNo[0].USER_NO, req.user],
                        (error, result) => {

                            if (result.affectedRows > 0) {
                                res.json(result.affectedRows);
                            } else {
                                res.json(null);
                            }

                        })
                } else {
                    res.json(null);
                }

            })
    },
    matchHidenFriend: (req, res) => {

        let query = req.query;

        DB.query(`SELECT * FROM REQUEST_FRIEND WHERE USER_ID = ? AND REQUEST_TARGET_ID = ? AND REQUEST_STATUS = 2`,
            [query.friendId, req.user],
            (error, hidenFriend) => {

                if (hidenFriend !== null && hidenFriend.length > 0) {
                    res.json(hidenFriend);

                } else {
                    res.json(null);
                }

            })

    },
    getHiddenFriends: (req, res) => {

        const query = `
            SELECT 
            rf.REQUEST_NO, rf.USER_ID, rf.USER_NICKNAME, rf.REQUEST_MESSAGE, 
                uif.USER_FRONT_IMG_NAME
            FROM 
                REQUEST_FRIEND rf
            JOIN 
                USER_IFM uif ON rf.USER_ID = uif.USER_ID
            WHERE 
                rf.REQUEST_TARGET_ID = ? AND rf.REQUEST_STATUS = 2
            ORDER BY 
                rf.REQUEST_REG_DATE DESC
        `;

        DB.query(query,
            [req.user],
            (error, hiddenFriends) => {

                if (hiddenFriends !== null && hiddenFriends.length > 0) {
                    res.json(hiddenFriends);

                } else {
                    res.json(null);
                }

            })
    },
    releaseHiddenFriend: (req, res) => {

        let query = req.query;

        DB.query(`UPDATE REQUEST_FRIEND SET REQUEST_STATUS = 0 WHERE REQUEST_NO = ?`,
            [query.friendNo],
            (error, result) => {

                if (result.affectedRows > 0) {
                    res.json(result.affectedRows);
                } else {
                    res.json(null);
                }

            })
    },
    addFavorite: (req, res) => {

        let post = req.body;
        console.log('>>>>favorite', post.no)

        DB.query(`UPDATE FRIEND SET FRIEND_FAVORITES = 1 WHERE FRIEND_NO = ?`,
            [post.no],
            (error, result) => {

                if (result.affectedRows > 0) {
                    res.json(result.affectedRows);
                } else {
                    res.json(null);
                }

            })
    },
    deleteFavorite: (req, res) => {

        let post = req.body;
        DB.query(`UPDATE FRIEND SET FRIEND_FAVORITES = 0 WHERE FRIEND_NO = ?`,
            [post.no],
            (error, result) => {

                if (result.affectedRows > 0) {
                    res.json(result.affectedRows);
                } else {
                    res.json(null);
                }

            })

    },
    getMyProfileImgs: (req, res) => {

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [req.user],
            (error, no) => {
                if (no !== null && no.length > 0) {

                    DB.query(`SELECT PROFILE_NAME FROM PROFILE_IMG 
                WHERE USER_NO = ? AND PROFILE_DIVIDE = 0 ORDER BY PROFILE_REG_DATE DESC`,
                        [no[0].USER_NO],
                        (error, frontImgs) => {

                            if (frontImgs !== null && frontImgs.length > 0) {
                                res.json(frontImgs);
                            } else {
                                res.json(null);
                            }
                        })

                } else {
                    res.json(null);
                }
            })

    },
    getMyBackImgs: (req, res) => {

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [req.user],
            (error, no) => {
                if (no !== null && no.length > 0) {

                    DB.query(`SELECT PROFILE_NAME FROM PROFILE_IMG 
                WHERE USER_NO = ? AND PROFILE_DIVIDE = 1 ORDER BY PROFILE_REG_DATE DESC`,
                        [no[0].USER_NO],
                        (error, backImgs) => {

                            if (backImgs !== null && backImgs.length > 0) {
                                res.json(backImgs);
                            } else {
                                res.json(null);
                            }
                        })

                } else {
                    res.json(null);
                }
            })

    },
    getFriendProfileImgs: (req, res) => {

        let query = req.query;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [query.selectId],
            (error, no) => {
                if (no !== null && no.length > 0) {

                    DB.query(`SELECT PROFILE_NAME FROM PROFILE_IMG 
                WHERE USER_NO = ? AND PROFILE_DIVIDE = 0 ORDER BY PROFILE_REG_DATE DESC`,
                        [no[0].USER_NO],
                        (error, friendFrontImgs) => {

                            if (friendFrontImgs !== null && friendFrontImgs.length > 0) {
                                res.json(friendFrontImgs);
                            } else {
                                res.json(null);
                            }
                        })

                } else {
                    res.json(null);
                }
            })

    },
    getFriendBackImgs: (req, res) => {

        let query = req.query;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`,
            [query.selectId],
            (error, no) => {
                if (no !== null && no.length > 0) {

                    DB.query(`SELECT PROFILE_NAME FROM PROFILE_IMG 
                WHERE USER_NO = ? AND PROFILE_DIVIDE = 1 ORDER BY PROFILE_REG_DATE DESC`,
                        [no[0].USER_NO],
                        (error, friendBackImgs) => {

                            if (friendBackImgs !== null && friendBackImgs.length > 0) {
                                res.json(friendBackImgs);
                            } else {
                                res.json(null);
                            }
                        })

                } else {
                    res.json(null);
                }
            })

    }


}

module.exports = friendService;