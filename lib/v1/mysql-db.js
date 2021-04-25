var mysql = require('mysql');

function handleDisconnect() {
    connection = mysql.createConnection({
        host     : process.env.MYSQL_HOST,
        user     : process.env.MYSQL_USERNAME,
        password : process.env.MYSQL_PASSWORD,
        database : process.env.MYSQL_DATABASE
    });

    connection.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            // if (global.configs.type == "release") {
                setTimeout(handleDisconnect, 2000);
            // }
        } else {
            // console.log('connect to mysql success', global.configs.mysql);
            global.connection = connection;
        }
    });
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FETAL_ERROR') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

var connect = function() {
    // if (mysqlConfig) {
        handleDisconnect();
    // }
};



module.exports = {
    connect: connect
};