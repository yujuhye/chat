const DB = require('../db/db');
const fs = require('fs');

const friendService = {

    friendList: (req, res) => {
        
        let query = req.query;

        DB.query(`SELECT USER_NO FROM USER_IFM WHERE USER_ID = ?`, 
        [query.user_id], 
        (error, no) => {

            if(no !== null && no.length > 0) {
                DB.query(`SELECT * FROM FRIEND WHERE USER_NO = ? AND FRIEND_IS_BLOCK = 0`, 
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

        let query = req.query;

        DB.query(`SELECT * FROM USER_IFM WHERE USER_ID = ? `, 
        [query.user_id], 
        (error, user) => {

            if(user !== null && user.length > 0) {

                res.json(user);

            } else {
                res.json(null);
            }

        })

    }
    

}

module.exports = friendService;