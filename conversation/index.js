var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(process.cwd() + '/public'));

app.get('/game/:id', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('join', function (game) {
    console.log("a user joined " + game);
    socket.game = game;
    socket.join(game);
  });

  socket.on("submit-question", function(data){
    console.log(socket.game);
      console.log("queston submitted: " + data.subject);
      socket.broadcast.to(socket.game).emit('receive-question', data);
  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});