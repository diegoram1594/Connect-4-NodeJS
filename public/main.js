var socket = io.connect();

var player={
  name:null,
  number:null
}

//Init board
var board= new Array(6);
for (var i = 0; i < 6; i++) {
  board[i] = new Array(7);
}

var localGame=null;
socket.on('gameStatus', function(data) {
  console.log(data);
    renderGameStatus(data,false);
});

socket.on('disconnectPlayer', function(data) {
  console.log(data);
  alert("A player left the Game");
  renderGameStatus(data,true);
});

socket.on('win', function(data,name) {
    console.log(data);
    renderGameStatus(data,true);
    alert(name+" Win");
    player={
      name:null,
      number:null
    };
});

socket.on('tie', function(data,name) {
  console.log(data);
  renderGameStatus(data,true);
  alert("Tie!");
  player={
    name:null,
    number:null
  };
});

function newPlayer(number){
  var playerName=document.getElementById('playerName').value;
  socket.emit("newPlayer",number,playerName);
  player.name=playerName;
  player.number=number;
}


function renderGameStatus (data,win) {
  localGame=data;
  if (win){
    data.player1.name="<i>Wating for player...</i>";
    data.player2.name="<i>Wating for player...</i>";
    data.player1.lock=false;
    data.player2.lock=false;
  }else{
    if(!!player.number){
      data.player1.lock=true;
      data.player2.lock=true;
    }

    if(data.player1.name==null){
      data.player1.name="<i>Wating for player...</i>";
    }
    if (data.player2.name==null){
      data.player2.name="<i>Wating for player...</i>";
    }
  }
  var html = (`<div>
              <strong>Player 1</strong>:
              <em>${data.player1.name}</em>
              <br>
              <strong>Player 2</strong>:
              <em>${data.player2.name}</em>
            </div>`);

    document.getElementById('gameStatus').innerHTML = html;
    document.getElementById("btnPlayer1").disabled = data.player1.lock;
    document.getElementById("btnPlayer2").disabled = data.player2.lock;

    if(win){
      document.getElementById("nameTurn").innerHTML="<h3>Game Over, Select player</h3>"; 
    }else if (data.gameStatus==='Playing' ){
      if( data.turn===player.number){
          document.getElementById("nameTurn").innerHTML="<h3>Your Turn!</h3>";   
        }else{
          document.getElementById("nameTurn").innerHTML="<h3>Opponent Turn</h3>"; 
        }
      }else{
        document.getElementById("nameTurn").innerHTML="" ;
      }

    var boardHtml="<table>";
    for (var i = 0; i < 6; i++) {
      boardHtml+="<tr>";
      for (var j=0;j<7;j++){
        boardHtml+="<th>";
        if(data.board[i][j]==null){
          boardHtml+=`<span class='dotWhite'onclick=selection(${i},${j})></span>`;
        }else if(data.board[i][j]==='R'){
          boardHtml+=`<span class='dotRed'></span>`;
        }else if(data.board[i][j]==='Y'){
          boardHtml+=`<span class='dotYellow'></span>`;
        }
        
        boardHtml+="</th>";
      }
      boardHtml+="</tr>";
    }
    boardHtml+="</table>";

    document.getElementById('gameBoard').innerHTML = boardHtml;

    
  
}

function selection(i,j){
  console.log(i,j);
  console.log(localGame);
  if (!!player.name && localGame.gameStatus==='Playing' && localGame.turn===player.number){
    socket.emit('turn',player,j);
  }
}

function addMessage(e) {
  var message = {
    author: document.getElementById('username').value,
    text: document.getElementById('texto').value
  };

  socket.emit('mensajeTest', message);
  return false;
  
}
