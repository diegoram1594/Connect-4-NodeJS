const express = require ('express');
const app = express();
const server= require('http').Server(app);
const io = require('socket.io')(server);

let port=3000;

let gameStatus="Preparing"
const connections = new Map();

app.use(express.static('public'));

io.on('connection',(socket)=>{
    console.log("Someone is connected with sockets");
    socket.emit("gameStatus",gameStatus);
    connections.set(socket, socket);


    socket.on('disconnect', function(){
        connections.delete(socket)
        gameStatus="Disconnect";
        console.log("DISCONECT");
        connections.forEach((value,key,map)=>{
            value.emit("gameStatus",gameStatus);
        });
        gameStatus="Preparing";
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
