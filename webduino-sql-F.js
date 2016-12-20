require('dotenv').config();

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.HOST_ADDRESS,
    user: process.env.USER_NAME,
    password: process.env.USER_PASSWORD,
    database: process.env.USER_DATABASE,
});

connection.connect();


var webduino = require('webduino-js');
console.log(process.env.BOARD_ID);

var board = new webduino.WebArduino(process.env.BOARD_ID);

board.on('ready', function() {
    console.log('Webduino ready.');
    var rfid = new webduino.module.RFID(board);
    rfid.on('enter', function(_uid) {
        if (rfid._uid && rfid._uid === _uid)
            return;

        rfid._uid = _uid;

        var card_id = 0;
        for (var i = 0; i < _uid.length; i += 2) {
            var uid_byte = parseInt(_uid.substr(i, 2), 16);
            card_id += uid_byte * Math.pow(2, i * 4);
        }
        console.log(card_id);

        connection.query('INSERT INTO `uidcheck` (`uid`, `time`) VALUES (' + card_id + ', ' + Math.floor((new Date()).getTime() / 1000) + ')', function(err, rows, fields) {
        if (err) throw err;
        console.log(rows, fields);
        });

        
    });

    rfid.read();
});


console.log('Node ready.');