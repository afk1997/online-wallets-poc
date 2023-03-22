// Import dependencies
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

// Create a new express app
const app = express();
const server = http.createServer(app);

// Create a new Socket.io server
const io = socketio(server);

// Initialize an empty mapping of wallets to socket IDs
let walletSocketMap = {};

// Listen for new client connections
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Listen for wallet connection events
  socket.on('connectWallet', (wallet) => {
    console.log(`Wallet connected: ${wallet}`);

    // Add the wallet to the mapping of wallets to socket IDs
    walletSocketMap[wallet] = socket.id;

    // Emit the updated list of online wallets to all clients
    const onlineWallets = Object.keys(walletSocketMap);
    io.emit('onlineWallets', onlineWallets);
  });

  // Listen for client disconnections
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Remove the disconnected wallet from the mapping of wallets to socket IDs
    const disconnectedWallet = Object.keys(walletSocketMap).find((wallet) => {
      return walletSocketMap[wallet] === socket.id;
    });
    if (disconnectedWallet) {
      delete walletSocketMap[disconnectedWallet];

      // Emit the updated list of online wallets to all clients
      const onlineWallets = Object.keys(walletSocketMap);
      io.emit('onlineWallets', onlineWallets);
    }
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
