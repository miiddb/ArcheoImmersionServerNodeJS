const express = require("express");
const app = express();
const port =  process.env.PORT || 3001;
var cors = require('cors')

app.use(cors())
const server = require('http').Server(app);


//var Players={}
var PlayersPositions ={}

function updatePlayerPos( Player, Pos){

		PlayersPositions[Player]= Pos


}

app.get("/", (req, res) => res.type('html').send(html));


server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
	console.log("Got connection!");
	
	socket.on('testEvent', (data) => {
		console.log("Received test Event " + data);
	});

    socket.on('playerUpdatePosition', (data) => {
		//console.log("positionUpdated" + data);
		const datajson = JSON.parse(data);

		console.log(datajson["playerName"])
		console.log(datajson["playerPosition"])

		updatePlayerPos(datajson["playerName"],datajson["playerPosition"] )
		//socket.emit("OtherPlayersPositions", PlayersPositions); // with unity standalone
		socket.emit("OtherPlayersPositions", JSON.stringify(PlayersPositions)); // when using webgl

	});


	socket.on('playerDisconnected', (player) => {
		console.log("player disconnected " + player);
		delete PlayersPositions[player];
		socket.emit("deletePlayer", JSON.stringify(player));

	});

	socket.on('playerChangedName', (data) => {
		const datajson = JSON.parse(data);

		oldName= datajson["oldName"]
		socket.emit("deletePlayer", JSON.stringify(oldName));

		newName=datajson["newName"]
		if (oldName!=newName ){
		console.log("player named changed from  " + oldName   + " to " + newName );
		PlayersPositions[newName] = PlayersPositions[oldName];
		
		delete PlayersPositions[oldName]; // comment  this to clone player when their name is changed
		}

		console.log("all players" + JSON.stringify(PlayersPositions) );

	});
	
	socket.on('error',function(er){
		console.log("some error " + er);

		console.log(er);
	});


	//soc = socket;
	socket.emit("testEvent", "Sending");

/*setInterval(() =>{

socket.emit("testEvent", "Sending recurring")
console.log("sending recurring");

}, 6000);
*/


});



const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>ArcheoiMmersionServer</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
Hello this is the Archeoimmersion server
</section>
  </body>
</html>
`
