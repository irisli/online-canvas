/*jshint node: true */

var socketio = require("socket.io");
var http = require("http");
var fs = require("fs");

var server = http.createServer(function(req, res) {
    res.writeHead(200, { "Content-type": "text/html"});
    res.end(fs.readFileSync(__dirname + "/index.html"));
}).listen(8013, function() {
    console.log("Listening at: http://localhost:" + server.address().port);
    console.log(server.address());
});

socketio.listen(server).set('transports',[
    'websocket',
    'xhr-polling',
    'jsonp-polling'
]).sockets.on("connection", function(socket) {
    socket.emit("welcome", " ");
    socket.on("message", function(msg) {
        // console.log("Mesage " + msg);
        socket.broadcast.emit("message", msg);
    });
});