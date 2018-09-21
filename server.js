var net = require('net');

var sockets = [];
var rooms = [
  {
    sockets: [],
    description: 'Welcome to Room 0',
    directions: ['right']
  },
  {
    sockets: [],
    description: 'Welcome to Room 1',
    directions: ['left', 'right']
  },
  {
    sockets: [],
    description: 'Welcome to Room 2',
    directions: ['left']
  }
]

/*
 * Cleans the input of carriage return, newline
 */
function cleanInput(data) {
  return data.toString().replace(/(\r\n|\n|\r)/gm,"").trim();
}

/*
 * Method executed when data is received from a socket
 */
function receiveData(socket, data) {
  var cleanData = cleanInput(data);
  if (cleanData === "goodbye") {
    socket.end('Goodbye!\n');
  } else {
    var found = rooms.find(function(room) {
      return room.sockets.includes(socket);
    });

    if (!found) {
      rooms[0].sockets.push(socket);
      socket.write(rooms[0].description + "\nExit: " + rooms[0].directions.join(", ") + "\n");
    } else if (found.directions.includes(cleanData)) {
      var socketIndex = found.sockets.indexOf(socket);
      found.sockets.splice(socketIndex, 1);
      var roomIndex = rooms.indexOf(found)
      var newRoom = newRoom = rooms[roomIndex];

      if (cleanData === 'right') {
        newRoom = rooms[roomIndex + 1];
      } else if (cleanData === 'left') {
        newRoom = rooms[roomIndex - 1];
      }

      newRoom.sockets.push(socket);
      socket.write(newRoom.description + "\nExit: " + newRoom.directions.join(", ") + "\n");
      newRoom.sockets.forEach(function(s) {
        if (s !== socket) {
          s.write("You heard someone or something approaching.");
        }
      });
    } else if (found) {
      socket.write(found.description + "\nExit: " + found.directions.join(", ") + "\n");
      found.sockets.forEach(function(s) {
        if (s !== socket) {
          s.write("You heard someone or something approaching.");
        }
      });
    }
    // for(var i = 0; i<sockets.length; i++) {
    // 	if (sockets[i] !== socket) {
    // 		sockets[i].write(data);
    // 	}
    // }
  }
}

/*
 * Method executed when a socket ends
 */
function closeSocket(socket) {
  var i = sockets.indexOf(socket);
  if (i != -1) {
    sockets.splice(i, 1);
  }
}

/*
 * Callback method executed when a new TCP socket is opened.
 */
function newSocket(socket) {
  sockets.push(socket);
  socket.write('You have connected to the server.\n');
  socket.on('data', function(data) {
    console.log('receive data: ' + data);
    receiveData(socket, data);
  })
  socket.on('end', function() {
    closeSocket(socket);
  })
}

// Create a new server and provide a callback for when a connection occurs
var server = net.createServer(newSocket);

// Listen on port 8888
server.listen(8888);
