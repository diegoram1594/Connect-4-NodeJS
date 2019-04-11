var socket = io.connect('http://localhost:3000', { 'forceNew': true });

socket.on('gameStatus', function(data) {
  console.log(data);
  if (data=='Preparing'){
    render(data);
  }
  if(data=='Disconnect'){
    alert("Other Player Disconnected");
  }
})

function render (data) {
  var html = (`<div>
              <strong>test</strong>:
              <em>test</em>
            </div>`);

  document.getElementById('messages').innerHTML = html;
}

function addMessage(e) {
  var message = {
    author: document.getElementById('username').value,
    text: document.getElementById('texto').value
  };

  socket.emit('mensajeTest', message);
  return false;
}
