var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var session = require('express-session');
var port = 8080;

app.use(express.static('./public'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'this is not a secret',
  resave: false,
  saveUninitialized: true
}));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/game/:code', function(req, res) {
  // var clientCount = 0;
  // var offsets = [0,0,0,0,0,0,0,0];

  // console.log('the code', req.params.code)

  // var name = io.of(req.params.code);

  // name.on('connection', function(socket) {
  //   console.log('a user connected.  count: ' + (clientCount++));

  //   // socket.emit('set team', (clientCount % 2) == 1 ? "1" : "-1");

  //   // socket.on('join room', function(room, playerName, isHost) {
  //   //   socket.room = room;
  //   //   socket.playerName = playerName;
  //   //   socket.isHost = isHost === 'true' ? true : false;

  //   //   socket.join(room);
  //   //   console.log('joined room', room + '; is host = ' + socket.isHost);

  //   //   if (socket.isHost) {
  //   //     socket.emit('set team', '1');
  //   //   } else {
  //   //     socket.emit('set team', '-1');
  //   //   }

  //   //   var tempRoom = io.nsps['/'].adapter.rooms[room];
  //   //   var totalClientsConnected = tempRoom ? Object.keys(tempRoom).length : 0;
  //   //   console.log('total clients in room ' + room + ': ' + totalClientsConnected);

  //   //   socket.broadcast.to(room).emit('room server message', playerName + ' joined the room');
  //   // });

  //   // socket.on('disconnect', function() {
  //   //   console.log('user', socket.playerName, 'disconnected from room', socket.room)
  //   //   socket.leave(socket.room);
  //   // });

  //   // socket.on('update state', function(msg, room, playerName) {
  //   //   // console.log('update state', room, playerName);
  //   //   console.log('update state', socket.room, room, socket.room === room)

  //   //   // if (socket.room === room) { // does not work as intended
  //   //     var data = JSON.parse(msg);

  //   //     // console.log('data', data);

  //   //     for(i=0; i < data.deltas.length; i++) {
  //   //       offsets[i] += data.team * data.deltas[i];
  //   //     }

  //   //     // socket.emit('update offsets', offsets.toString(), room);
  //   //     io.to(room).emit('update offsets', offsets.toString(), room);
  //   //     // io.sockets.in

  //   //     // console.log('offsets: ' + offsets.toString());
  //   //   // }
  //   // });
  // });


  res.render('game', {
    accessCode: req.session.accessCode,
    playerName: req.session.playerName,
    isHost: req.session.isHost
  });
});

app.get('/host', function(req, res) {
  res.render('host');
});

app.get('/join', function(req, res) {
  res.render('join');
});

app.get('/lobby/:code', function(req, res) {
  req.session.accessCode = req.params.code;
  res.render('lobby', {
    accessCode: req.params.code,
    playerName: req.session.playerName,
    isHost: req.session.isHost
  });
});

app.post('/games', function(req, res) {
  req.session.playerName = req.body.playerName;
  req.session.isHost = true;
  res.redirect('/lobby/' + generateAccessCode());
});

app.post('/join', function(req, res) {
  req.session.playerName = req.body.playerName;
  res.redirect('/lobby/' + req.body.accessCode);
});

// Credit goes to Spyfall: https://github.com/evanbrumley/spyfall
function generateAccessCode() {
  var code = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz';

  for (var i = 0; i < 6; i++) {
    code += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return code;
}

var clientCount = 0;
var offsets = [0,0,0,0,0,0,0,0];

var name = io.of('/test');

name.on('connection', function(socket) {
  console.log('a user connected.  count: ' + (clientCount++));
});

// var clientCount = 0;
// var offsets = [0,0,0,0,0,0,0,0];

// io.on('connection', function(socket) {
//   console.log('a user connected.  count: ' + (clientCount++));

//   // socket.emit('set team', (clientCount % 2) == 1 ? "1" : "-1");

//   socket.on('join room', function(room, playerName, isHost) {
//     socket.room = room;
//     socket.playerName = playerName;
//     socket.isHost = isHost === 'true' ? true : false;

//     socket.join(room);
//     console.log('joined room', room + '; is host = ' + socket.isHost);

//     if (socket.isHost) {
//       socket.emit('set team', '1');
//     } else {
//       socket.emit('set team', '-1');
//     }

//     var tempRoom = io.nsps['/'].adapter.rooms[room];
//     var totalClientsConnected = tempRoom ? Object.keys(tempRoom).length : 0;
//     console.log('total clients in room ' + room + ': ' + totalClientsConnected);

//     socket.broadcast.to(room).emit('room server message', playerName + ' joined the room');
//   });

//   socket.on('disconnect', function() {
//     console.log('user', socket.playerName, 'disconnected from room', socket.room)
//     socket.leave(socket.room);
//   });

//   socket.on('update state', function(msg, room, playerName) {
//     // console.log('update state', room, playerName);
//     console.log('update state', socket.room, room, socket.room === room)

//     // if (socket.room === room) { // does not work as intended
//       var data = JSON.parse(msg);

//       // console.log('data', data);

//       for(i=0; i < data.deltas.length; i++) {
//         offsets[i] += data.team * data.deltas[i];
//       }

//       // socket.emit('update offsets', offsets.toString(), room);
//       io.to(room).emit('update offsets', offsets.toString(), room);
//       // io.sockets.in

//       // console.log('offsets: ' + offsets.toString());
//     // }
//   });
// });

http.listen(port, function() {
  console.log('socket.io listening on port ' + port);
});
