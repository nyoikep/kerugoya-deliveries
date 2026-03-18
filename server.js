const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    transports: ['websocket'],
  });
  global.io = io;

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinDeliveryRoom', (deliveryId) => {
      socket.join(deliveryId);
      console.log(`User ${socket.id} joined room ${deliveryId}`);
    });

    socket.on('client_location_update', (data) => {
      const { deliveryId, latitude, longitude } = data;
      if (deliveryId) {
        socket.to(deliveryId).emit('client_location_broadcast', { latitude, longitude });
      }
    });

    socket.on('rider_location_update', (data) => {
      const { deliveryId, latitude, longitude } = data;
      if (deliveryId) {
        socket.to(deliveryId).emit('rider_location_broadcast', { deliveryId, latitude, longitude });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.emit('message', 'Welcome to the Socket.IO server!');
  });
  
  // Attach io to all requests
  httpServer.on('request', (req, res) => {
    req.io = io;
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running on port ${port}`);
    });
});
