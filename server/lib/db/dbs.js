const mysql = require('mysql');

const DBs = {

    DB_LOCAL: () => {

        return mysql.createConnection({
            host: 'localhost',
            port: '3306',
            user: 'roor',
            password: '1234',
            database: 'CHAT_SERVICE',
            dateStrings: true,
        });

    },

}

module.exports = DBs;