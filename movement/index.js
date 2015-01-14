var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(process.cwd() + '/public'));

app.get('/game/:id', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var games = {};

io.on('connection', function(socket){

  socket.on('register-player', function (data) {
    console.log(data.playerId + " joined " + data.gameId);
    socket.game = data.gameId;
    if(games[socket.game]){
    	games[socket.game].players.push(data.playerId);
    } else {
    	games[socket.game] = {players : [data.playerId]};

    }
    socket.join(socket.game);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

