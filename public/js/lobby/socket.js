var roomName = $('#accessCode').text();
var socket = io(roomName);
var playerName = $('#playerName').text();
var isHost = $('#isHost').val();

// socket.emit('join room', roomName, playerName, isHost);

// socket.on('room server message', function(message) {
//   console.log('[room server message] ' + message);

//   $('#serverMessages').append('<p>' + message + '</p>');
// });