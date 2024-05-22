const mysql = require('mysql');

const DBs = {

    DB_LOCAL: () => {

        return mysql.createConnection({
            port: '3306',
            user: 'root',
            password: '1234',
            database: 'CHAT_SERVICE',
            dateStrings: true,
        });

    },
    DB_PROD: () => {
        return mysql.createConnection({
            host: 'chat-server.c9gk42ygyqxl.us-east-1.rds.amazonaws.com',
            port: '3306',
            user: 'root',
            password: '12345678',
            database: 'CHAT_SERVICE',
            dateStrings: true,
        });
    },

}

module.exports = DBs;