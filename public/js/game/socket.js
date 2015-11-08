var roomName = $('#accessCode').val();
var socket = io.connect('/test');
var playerName = $('#playerName').val();
var isHost = $('#isHost').val();

console.log('socket made', socket)

// socket.emit('join room', roomName, playerName, isHost);

// socket.on('room server message', function(message) {
//   console.log('[room server message] ' + message);
// });

// // not currently used
// // socket.on('game update', function(msg){
// //   data = JSON.parse(msg);
// //   console.log(data);
// // });

// socket.on('set team', function(msg) {
//   console.log("set team: " + msg)
//   if (msg == '1') {
//     Game.STATE.team = 1;
//   }
//   if (msg == '-1') {
//     Game.STATE.team = -1;
//   }
// });

// socket.on('update offsets', function(msg) {
//   // console.log('got data: ' + msg)
//   // console.log('update offsets', room, 'actual', roomName);

//   // if (room === roomName) {

//   var offsets = msg.split(",");
//   for(var i=0; i<offsets.length; i++) { offsets[i] = +offsets[i]; }

//   // console.log('converted: ' + offsets);

//    // console.log(Game.SETTINGS.numLanes);

//   for(i=0; i < Game.SETTINGS.numLanes; i++) {
//     // convert offsets to positions and update heroes on screen
//     // console.log(PlayerOne.heroes[i].x +'   '+ (40 + offsets[i]) * Game.VIEWPORT.sizePerStep )
//     //PlayerOne.heroes[laneCopy].sprite.position.x

//     PlayerOne.heroes[i].sprite.position.x = (Game.SETTINGS.numSteps/2 + offsets[i]) * Game.VIEWPORT.sizePerStep;
//   }
// });
