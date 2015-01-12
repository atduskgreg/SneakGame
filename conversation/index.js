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
  console.log('a user connected');

  socket.on('join', function (game) {
    console.log("a client joined " + game);
    socket.game = game;
    if(!games[game]){
      games[game] = {characters : []};
    }
    socket.join(game);
  });

  socket.on("register-character", function(data){
    console.log("register-character");
    games[socket.game].characters.push(data);
    characterId = games[socket.game].characters.length - 1;
    socket.characterIdx = characterId;

    if(games[socket.game].characters.length == 2){
      io.sockets.in(socket.game).emit('start-timer', {duration: 3000});
    }

    console.log(games[socket.game].characters.length);

    io.sockets.in(socket.game).emit('update-characters', characterId, games[socket.game].characters);
  })

  socket.on("submit-question", function(data){
    console.log(socket.game);
      console.log("queston submitted");
      socket.broadcast.to(socket.game).emit('receive-question', data);
  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
    if(games[socket.game]){
      games[socket.game].characters.splice(socket.characterIdx, 1);
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});