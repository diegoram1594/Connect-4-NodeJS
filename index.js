const express = require ('express');
const app = express();
const server= require('http').Server(app);
const io = require('socket.io')(server);

let port=process.env.PORT || 8080;

//Init board
let newBoard= new Array(6);
for (let i = 0; i < 6; i++) {
    newBoard[i] = new Array(7);
}

let game={
    gameStatus :"Preparing",
    player1: {
        name:null,
        lock:false
    },
    player2: {
        name:null,
        lock:false
    },
    turn:"p1",
    board:newBoard
}
let statusNewGame=JSON.parse(JSON.stringify(game));

const connections = new Map();
let player1Connection=null;
let player2Connection=null;
app.use(express.static('public'));

io.on('connection',(socket)=>{
    console.log("Someone is connected with sockets");
    socket.emit("gameStatus",game);
    connections.set(socket, socket);


    //New player
    socket.on('newPlayer',(number,name)=>{
        console.log(`new player ${name} ${number}`)
        if(number=='p1'){
            game.player1.name=name;
            player1Connection=socket;
            game.player1.lock=true;
        }
        if(number=='p2'){
            game.player2.name=name;
            player2Connection=socket;
            game.player2.lock=true;
        }
        if(game.player1.lock && game.player2.lock){
            game.gameStatus="Playing";
            game.turn="p1";

        }
        connections.forEach((value,key,map)=>{
            value.emit("gameStatus",game);
        });
    });

    //Turn Player
    socket.on('turn',(player, line)=>{
        console.log(`turn ${player.name} in ${line}`);
        var color="";
        if(player.number==='p1'){
            game.turn="p2";
            color="R"
        }
        if(player.number==='p2'){
            game.turn="p1";
            color="Y"
        }
        let i=0
        for(i=5;i>=0;i--){
            if(game.board[i][line]==null){
                game.board[i][line]=color;
                break;
            }
        }

        //verify win
        let win=false;
        //Left
        let verLeft=line-1;
        let cont=0;
        while(verLeft>=0 && game.board[i][verLeft]==color){
            cont++;
            verLeft--;
        }
        let verRight=line+1;
        while(verRight<=6 && game.board[i][verRight]==color){
            cont++;
            verRight++;
        }
        if(cont>=3){
            //Winner
            win=true;
        }else{
            //Up
            let verUp=i-1;
            cont=0;
            while(verUp>=0 && game.board[verUp][line]==color){
                cont++;
                verUp--;
            }
            //Down
            let verDown=i+1;
            while(verDown<=5 && game.board[verDown][line]==color){
                cont++;
                verDown++;
            }
            if(cont>=3){
                //Winner
                win=true;
            }else{
                //Diagonal Left
                let verLineLeft=line-1;
                let verColLeft=i-1;
                cont=0;
                while(verLineLeft>=0 && verColLeft>=0 && game.board[verColLeft][verLineLeft]==color){
                    verLineLeft--;
                    verColLeft--;
                    cont++;
                }
                let verLineRight=line+1;
                let verColRight=i+1;
                while(verLineRight<=6 && verColRight<=5 && game.board[verColRight][verLineRight]==color){
                    verLineRight++;
                    verColRight++;
                    cont++;
                }
                if (cont>=3){
                    //Winner
                    win=true;
                }else{
                     //Diagonal Right
                    verLineLeft=line-1;
                    verColLeft=i+1;
                    cont=0;
                    while(verLineLeft>=0 && verColLeft<=5 && game.board[verColLeft][verLineLeft]==color){
                        verLineLeft--;
                        verColLeft++;
                        cont++;
                    }
                    verLineRight=line+1;
                    verColRight=i-1;
                    while(verLineRight<=6 && verColRight>=0 && game.board[verColRight][verLineRight]==color){
                        verLineRight++;
                        verColRight--;
                        cont++;
                    }if (cont>=3){
                        //Winner
                        win=true;
                    }
                }
            }
        }


        
        if (!win){
            //Verify Tie
            var tie=true;
            for (var ii = 0; ii < 6; ii++) {
                for (var j=0;j<7;j++){
                  if(game.board[ii][j]==null){
                    tie=false;
                  }
                }
            }

            if(tie){
                connections.forEach((value,key,map)=>{
                    value.emit("tie",game);
                });
                game=JSON.parse(JSON.stringify(statusNewGame));
            }else{
                connections.forEach((value,key,map)=>{
                    value.emit("gameStatus",game);
                });
            }            
        }else{
            connections.forEach((value,key,map)=>{
                value.emit("win",game,player.name);
            }); 
            game=JSON.parse(JSON.stringify(statusNewGame));
        }
    })

    //Any user disconnect
    socket.on('disconnect', function(){
        connections.delete(socket)
        gameStatus="Disconnect";
        console.log("DISCONECT");
        

        if(socket===player1Connection || socket===player2Connection){
            //Unlock players
            game=JSON.parse(JSON.stringify(statusNewGame));
            console.log("Player disconnected");
            connections.forEach((value,key,map)=>{
                value.emit("disconnectPlayer",game);
                //connections.delete(value)
            });
        }

      });
});


const banner=`
******************************
    Basic Node.js Course
      CONNECT 4 Server
       Diego Ramirez
******************************`;


console.log(banner);
server.listen(port,()=>{
    console.log(`Listening port: ${port}`)
    })
