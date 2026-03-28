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

    socket.on('joinAdminRoom', () => {
      socket.join('admin_room');
      console.log(`Admin ${socket.id} joined admin_room`);
    });

    socket.on('client_location_update', (data) => {
      const { deliveryId, latitude, longitude } = data;
      if (deliveryId) {
        socket.to(deliveryId).emit('client_location_broadcast', { deliveryId, latitude, longitude });
        // Also broadcast to admins
        socket.to('admin_room').emit('admin_location_update', { ...data, type: 'CLIENT' });
      }
    });

    socket.on('rider_location_update', (data) => {
      const { deliveryId, latitude, longitude } = data;
      if (deliveryId) {
        socket.to(deliveryId).emit('rider_location_broadcast', { deliveryId, latitude, longitude });
        // Also broadcast to admins
        socket.to('admin_room').emit('admin_location_update', { ...data, type: 'RIDER' });
      }
    });

    // New event for instant pings to riders
    socket.on('new_delivery_ping', (data) => {
      const { riderId, delivery } = data;
      // Broadcast to all (riders listen for their ID or 'all' if pending)
      socket.broadcast.emit('rider_ping', { riderId, delivery });
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
