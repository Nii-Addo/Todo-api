/*
 * Call module dependencies
 */

var app = require('./app');
var http = require('http');
var debug = require('debug')('http');
var mongoose = require('mongoose');

require('dotenv').config();

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/*
 * Create http server
 */
const server = http.createServer(app);

/*
 **connect to database
 */
const uri =
  'mongodb+srv://admin:challenge@cluster0.voi7o.mongodb.net/<dbname>?retryWrites=true&w=majority';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  poolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};
mongoose
  .connect(uri, options)
  .catch((error) => console.log('Database Error:' + error));
/*handleError(error));*/
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDb database connection established successfully');
});

/**
 * Listen on provided port
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

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

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

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

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
