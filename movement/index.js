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
    console.log(data.clientId + " joined " + data.gameId + " characterName: " + data.player.name + " color: " + data.player.color);
    socket.game = data.gameId;
    socket.clientId = data.clientId;
    if(games[socket.game]){
    	games[socket.game].clients.push(data);
    } else {
    	games[socket.game] = {clients : [data]};

    }
    socket.join(socket.game);
    io.sockets.in(socket.game).emit('clients', games[socket.game].clients);
  });

  socket.on('send-move', function(data){
 	socket.broadcast.to(socket.game).emit('receive-move', data);
  });

  socket.on('shuffle-characters', function(data){
  	console.log("shuffle-characters");
 	socket.broadcast.to(socket.game).emit('receive-shuffle', data);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    if(games[socket.game]){
    	for(var i = 0; i < games[socket.game].clients.length; i++){
    		if(games[socket.game].clients[i].clientId == socket.clientId){
    			games[socket.game].clients.splice(i, 1);
    		}
    	}
    // TODO : handle disconnect in client
    //io.sockets.in(socket.game).emit('clients', games[socket.game].clients);
    }
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

