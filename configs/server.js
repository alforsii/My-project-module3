
// const app = require('../server');
// // const server = require('http').Server(app);
// const server = require('http').createServer(app);


// const port = process.env.PORT || '3000'

// server.listen(port, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow));

var app = require('../server');
var debug = require('debug')('project3:server');
var server = require('http').Server(app);
const io = require('socket.io')(server);


var port = normalizePort(process.env.PORT || 5000);
app.set('port', port);

//socket route
require('../routes/messages/messaging.io')(io);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, ()=> console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow));
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
