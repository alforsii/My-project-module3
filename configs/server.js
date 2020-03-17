
const app = require('../server');
const server = require('http').Server(app);
// const server = require('http').createServer(app);


const port = process.env.PORT || '3000'

server.listen(port, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow));
