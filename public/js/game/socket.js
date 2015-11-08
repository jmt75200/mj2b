// var socket = io();
var socket = io.connect();
console.log('access code', document.getElementById('accessCode').value)
socket.emit('join room', 'room1');

// if (window.location.hostname == 'localhost')
//   socket = io(window.location.hostname + ':3000')
// else
//   socket = io(window.location.hostname)

// var socket = io(window.location.hostname);

socket.on('room server message', function(message) {
  console.log('client received room server message: ' + message);
});

socket.on('game update', function(msg){
  data = JSON.parse(msg);
  console.log(data);
});

socket.on('set team', function(msg) {
  console.log("set team: " + msg)
  if (msg == '1') {
    Game.STATE.team = 1;
  }
  if (msg == '-1') {
    Game.STATE.team = -1;
  }
});

socket.on('update offsets', function(msg) {
  // console.log('got data: ' + msg)

  var offsets = msg.split(",");
  for(var i=0; i<offsets.length; i++) { offsets[i] = +offsets[i]; }

  // console.log('converted: ' + offsets);

   // console.log(Game.SETTINGS.numLanes);

  for(i=0; i < Game.SETTINGS.numLanes; i++) {
    // convert offsets to positions and update heroes on screen
    // console.log(PlayerOne.heroes[i].x +'   '+ (40 + offsets[i]) * Game.VIEWPORT.sizePerStep )
    //PlayerOne.heroes[laneCopy].sprite.position.x

    PlayerOne.heroes[i].sprite.position.x = (40 + offsets[i]) * Game.VIEWPORT.sizePerStep;
  }

});

