// HTTP Portion
var http = require('http');
var fs = require('fs');
var httpServer = http.createServer(requestHandler);
httpServer.listen(3000);

console.log("listening on 3000")

function requestHandler(req, res){
	//read the html file and callback function
	fs.readFile(__dirname + '/p2p.html', function (err, data) {
		// if there is an error
		if (err) {
			res.writeHead(500);
			return res.end('Well, shit!');
		}
		// otherwise send the data
		res.writeHead(200);
		res.end(data);
	});
}

// websockets portion 
// websockets work with the http httpServer
var io = require('socket.io').listen(httpServer);

// since io.sockets.clients() no longer works ??
var connectedSockets = [];

var fiveSecondCountDown = false;
var count = 5;

// register a callback function to run wehen we have an individual connection.
// this is run for each individual user that connectedSockets
io.sockets.on('connection', function (socket){

	console.log("We have a new client: " + socket.id);

	// add to the connectedSockets array
	connectedSockets.push(socket); 

	socket.on('peer_id', function (data){
		console.log("Received: 'peer_id' " + data);

		// we can save this in the socket object
		socket.peer_id = data;
		console.log("Saved: " + socket.peer_id);

		// we can loop through these
		for (var i = 0; i < connectedSockets.length; i++) {
			console.log("loop: " + i + " " + connectedSockets[i].peer_id);
		}

		checkCountdown();

		// tell everyone my peer_id
		socket.broadcast.emit('peer_id_server', data);
	});

	// receives a random photo from a client
	socket.on('randomPhoto', function(image){

		console.log("Received an image!");
		socket.broadcast.emit('makeOverTime', image);

	})

	socket.on('disconnect', function(){
		console.log("Client has disconnected");
		var indexToRemove = connectedSockets.indexOf(socket);
		connectedSockets.splice(indexToRemove, 1);

		//tells all clients who disconnected
		io.sockets.emit('peer_disconnect', socket.peer_id);

		console.log("Users Connected : " + connectedSockets.length);
	});
});

var checkCountdown = function(){
	console.log("Users Connected : " + connectedSockets.length);

	if (connectedSockets.length == 3){
		console.log("The Countdown Begins");
		fiveSecondCountDown = true;
	}	
	
	countdown();
}

// this is the countdown function that transmits 

var countdown = function(){

	if (fiveSecondCountDown){
		count --;
		console.log(count);
		io.sockets.emit('countdownEvent01', count);


		if(count == 0){
			fiveSecondCountDown = false;
			count = 5;

			selectRandomUser();
		}

		setTimeout(countdown, 1000);
	}
}


// this function selects a random user and broadcasts their id to all clients 

var selectRandomUser = function(){

	var selector = Math.floor(Math.random() * 3);
	io.sockets.emit('randomSelection', connectedSockets[selector].peer_id);

}











