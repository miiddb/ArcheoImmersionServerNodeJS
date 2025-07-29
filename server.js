const express = require("express");
var bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
var cors = require('cors')

app.use(bodyParser.json({limit: '50mb'}));
app.use(cors())
const port = 2300;

const server = require('http').Server(app);
const pool = require("./db")
//client.connect();


//const args = process.argv;

//console.log(args);




//var Players={}
var PlayersPositions ={}

function updatePlayerPos( Player, Pos){

		PlayersPositions[Player]= Pos


}

app.get('/',  (req, res) => {
	res.send('Hello I am the Archeoimmersion Sever!!!')
  })

app.post("/addNote",async (req, res) =>{
	try {
		const {title,
				creator,
				lasteditor,
				id,
				comment,
				creationtime,
				lastedittime,
				selectionshape,
				transformposition,
				transformrotationquat,
				selectiontransformposition,
				selectiontransformscale,
				selectiontransformrotationquat,
				selectioncolour,
				b64image,
				category}
				 = req.body

		console.log("creating the annotation " + title + " by the creator: " +creator);
		console.log(req.body);
			const newAnnotation = await pool.query(
				 `INSERT INTO annotations_temple 
				(title,
				creator,
				lasteditor,
				id,
				comment,
				creationtime,
				lastedittime,
				selectionshape,
				transformposition,
				transformrotationquat,
				selectiontransformposition,
				selectiontransformscale,
				selectiontransformrotationquat,
				selectioncolour,
				b64image,
				category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10, $11,$12, $13,$14, $15,$16) 
				ON CONFLICT (id) DO NOTHING;
				`
				,[title,
				creator,
				lasteditor,
				id,
				comment,
				creationtime,
				lastedittime,
				selectionshape,
				transformposition,
				transformrotationquat,
				selectiontransformposition,
				selectiontransformscale,
				selectiontransformrotationquat,
				selectioncolour,
				b64image,
				category]
			);
		
		//res.json(newAnnotation.rows[0].id);


		io.emit("AddedNote",id);
		console.log ("note added " + id);

		//console.log(res);
	}
	catch (err) {
		console.log( " error while posting" +  err);
	}

});



app.get("/allNotes", async (req,res) =>{
try{
 const allAnnotations = await pool.query("SELECT * FROM annotations_temple ");
 res.json(allAnnotations.rows)

}
catch (err){
	console.log ("error getting all notes")
	console.log (err.message)
}
});


app.get("/allCategories", async (req,res) =>{
	try{
	 const allCategories = await pool.query("SELECT DISTINCT category FROM annotations_temple;");
	 res.json(allCategories.rows)
	
	}
	catch (err){
		console.log ("error getting all categories")
		console.log (err.message)
	}
	});





app.get("/getNote/:id", async (req,res) =>{
		const {id} =  req.params;
		try{

		 const singeAnnotation = await pool.query("SELECT * FROM annotations_temple WHERE id = $1 " ,[id]);
		 res.json(singeAnnotation.rows)
		
		}
		catch (err){
			console.log ("error getting a note")
			console.log (err.message)
		}

});


app.put("/editNote/:id", async (req,res) =>{
	try{
		const {id} =  req.params;
		const {title,
				creator,
				lasteditor,
				comment,
				creationtime,
				//lastedittime,
				selectionshape,
				transformposition,
				transformrotationquat,
				selectiontransformposition,
				selectiontransformscale,
				selectiontransformrotationquat,
				selectioncolour,
				b64image,
				category}
				 = req.body
		
	//console.log ("req.body"	);

		 var date = new Date();
		const lastedittime=date.toISOString();

	//console.log (req.body	);

	 const editedAnnotation = await pool.query(`
	 
	 UPDATE annotations_temple 
	 
	 SET title= $1,
		creator = $2 ,
		LastEditor= $3,
		comment = $4,
		creationtime = $5,
		lastedittime= $6 ,
		selectionshape = $7,
		transformposition= $8,
		transformrotationquat= $9,
		selectiontransformposition= $10,
		selectiontransformscale= $11,
		selectiontransformrotationquat= $12,
		selectioncolour= $13,
		b64image= $14,
		category=$15
		
	 
	 WHERE id = $16	 ;
	 
	 ` ,[title,
		creator,
		lasteditor,
		comment,
		creationtime,
		lastedittime,
		selectionshape,
		transformposition,
		transformrotationquat,
		selectiontransformposition,
		selectiontransformscale,
		selectiontransformrotationquat,
		selectioncolour,
		b64image,
		category,
		id]);
	 res.json( "annotation edited !"  );
	
//showing content of updated columns
//console.log(editedAnnotation.rows );



	io.emit("EditedNote", id);
	console.log ("note edited " + id)



	}
	catch (err){
		console.log ("error putting a note")
		console.log (err.message)
	}

});


app.delete("/deleteNote/:id", async (req,res) =>{
	try{
		const {id} =  req.params;

	 const deletedAnnotation = await pool.query("DELETE FROM annotations_temple WHERE id = $1 " ,[ id]);


	 io.emit("DeletedNote", id);
	 console.log ("note deleted  " + id)

	 res.json("annotation deleted !");
	
	}
	catch (err){
		console.log ("error deleting a note")
		console.log (err.message)
	}

});

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

const io = require("socket.io")(server, {
	cors: {
        origin: '*'
    }
});

io.on('connection', (socket) => {
	console.log("Got connection!");
	
	socket.on('playerConnected', (data) => {
		console.log("Received new connection from player " + data);
		PlayersPositions={};
	});

    socket.on('playerUpdatePosition', (data) => {
		//console.log("positionUpdated" + data);
		const datajson = JSON.parse(data);

		//console.log(datajson["playerName"])
		//console.log(datajson["playerPosition"])

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
	socket.emit("serverAnswers", "answer form server");

const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

setInterval(async () => {
  try {
    socket.emit("testEvent", "Sending recurring");
    console.log("sending recurring");

    const lastedittime = new Date().toISOString();
    const id = 'a93d619d-4dbc-4ead-b863-94e138341b76';

    await pool.query(`
      UPDATE annotations_temple 
      SET 
        title = $1,
        creator = $2,
        LastEditor = $3,
        comment = $4,
        creationtime = $5,
        lastedittime = $6,
        selectionshape = $7,
        transformposition = $8,
        transformrotationquat = $9,
        selectiontransformposition = $10,
        selectiontransformscale = $11,
        selectiontransformrotationquat = $12,
        selectioncolour = $13,
        b64image = $14,
        category = $15
      WHERE id = $16;
    `, [
      "automatic bookmark",
      "automatically created",
      "automatically created",
      "last updated",
      lastedittime,
      lastedittime,
      "",
      [0, 0, -20],
      [0, 0, 0, 0],
      [0, 0, 0],
      1,
      [0, 0, 0, 0],
      "",
      "",
      "automatic",
      id
    ]);

    console.log("Recurring annotation updated!");
  } catch (error) {
    console.error("Error updating annotation:", error);
  }
}, FOUR_DAYS_MS);


});






