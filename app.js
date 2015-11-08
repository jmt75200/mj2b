var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('./public'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/game', function(req, res) {
  res.render('game');
});

app.get('/host', function(req, res) {
  res.render('host');
});

app.get('/join', function(req, res) {
  res.render('join');
});

var port = 3000;
app.listen(port);
console.log('Express server started on port %s', port);

var clientCount = 0;
var offsets = [0,0,0,0,0,0,0,0];

io.on('connection', function(socket){
  console.log('a user connected.  count: ' + (clientCount++));

  socket.emit('set team', (clientCount % 2) == 1 ? "1" : "-1"  )

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('update state', function(msg) {
    // console.log(msg);

    data = JSON.parse(msg);

    console.log(data);

    for(i=0; i < data.deltas.length; i++) {
      offsets[i] += data.team * data.deltas[i];
    }

    socket.emit('update offsets', offsets.toString() );

    console.log('offsets: ' + offsets.toString() );

  });
});

http.listen(8080, function(){
  console.log('socket.io listening on *:8080');
});
