var socket = io.connect();
var roomName = $('#accessCode').text();
var playerName = $('#playerName').text();

socket.emit('join room', roomName, playerName);

socket.on('room server message', function(message) {
  console.log('client received room server message: ' + message);

  $('#stuff').append('<p>' + message + '</p>');
});
