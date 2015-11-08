var socket = io.connect();
var roomName = $('#accessCode').text();
var playerName = $('#playerName').text();
var isHost = $('#isHost').val();

socket.emit('join room', roomName, playerName, isHost);

socket.on('room server message', function(message) {
  console.log('[room server message] ' + message);

  $('#serverMessages').append('<p>' + message + '</p>');
});

socket.on('game started', function(room) {
  window.location.href = '/game/' + room;
});

$('#startGame').click(function(evt) {
  socket.emit('start game', roomName);
});
