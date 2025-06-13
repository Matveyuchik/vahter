const express = require('express');
const server = express();

server.get("/", (req, res) => {
    res.send('Бот запускается');
});

function keepAlive() {
    server.listen(3000, () => {
        console.log('Сервер готов');
    });
}

module.exports = keepAlive;