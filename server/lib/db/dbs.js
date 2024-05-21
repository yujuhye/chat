const mysql = require('mysql');

const DBs = {

    DB_LOCAL: () => {

        return mysql.createConnection({
            host: '192.168.219.100',
            port: '3306',
            user: 'root',
            password: '1234',
            database: 'CHAT_SERVICE',
            dateStrings: true,
        });

    },

}

module.exports = DBs;