require("dotenv").config();
let mysql = require("mysql");

let getMySQLConnection = new Promise((resolve, reject) => {
    let connection;
    if (process.env.NODE_ENV) {
        let config = {
            user: process.env.SQL_USER,
            database: process.env.SQL_DATABASE,
            password: process.env.SQL_PASSWORD,
        }

        if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
            config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
        }

        connection = mysql.createConnection(config);
    } else {
        connection = mysql.createConnection({
          host: process.env.SQL_HOST,
          user: process.env.SQL_USER,
          database: process.env.SQL_DATABASE,
          password: process.env.SQL_PASSWORD
        });
    }

    connection.connect(function(err) {
        if (err) {
          console.error('Error connecting: ' + err.stack);
          return;
        }
        console.log('Connected as thread id: ' + connection.threadId);
        resolve(connection);
    });
});

module.exports = exports = getMySQLConnection;
