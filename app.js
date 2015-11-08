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

app.get('/game', function(req, res) {
  res.render('game');
});

app.get('/host', function(req, res) {
  res.render('host');
});

app.get('/join', function(req, res) {
  res.render('join');
});

app.get('/lobby/:code', function(req, res) {
  res.render('lobby', {
    accessCode: req.params.code,
    playerName: req.session.playerName
  });
});

app.post('/games', function(req, res) {
  req.session.playerName = req.body.playerName;
  res.redirect('/lobby/' + generateAccessCode());
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

io.on('connection', function(socket) {
  console.log('a user connected.  count: ' + (clientCount++));

  socket.emit('set team', (clientCount % 2) == 1 ? "1" : "-1"  )

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('update state', function(msg) {
    // console.log(msg);

    data = JSON.parse(msg);

    // console.log(data);

    for(i=0; i < data.deltas.length; i++) {
      offsets[i] += data.team * data.deltas[i];
    }

    socket.emit('update offsets', offsets.toString());

    // console.log('offsets: ' + offsets.toString());

  });
});

http.listen(port, function() {
  console.log('socket.io listening on port ' + port);
});
