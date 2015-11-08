var socket = io.connect();
var roomName = document.getElementById('accessCode').innerHTML;
console.log('access code:', roomName);

socket.emit('join room', roomName);

socket.on('room server message', function(message) {
  console.log('client received room server message: ' + message);
});
