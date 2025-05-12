const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = socketIo(server);

app.use(express.static("public"));

const users = new Set();

io.on("connection", (socket) => {
  console.log("A user is now connected");

  //handle users when they join the chat
  socket.on("join", (userName) => {
    users.add(userName);
    socket.userName = userName;

    //broadcast to all clients/users when a user has joined

    io.emit("userJoined", userName);

    //send the updated user list to all the clients
    io.emit("userList", Array.from(users));
  });

  //handle incoming chat message
  socket.on("chatMessage", (message) => {
    //broadcast the received message to all the clients
    io.emit("chatMessage", message);
  });

  //handle user disconnected
  socket.on("disconnect", () => {
    console.log("An User has disconnected", socket.userName);

    users.forEach((user) => {
      if (user === socket.userName) {
        users.delete(user);

        io.emit("userLeft", user);

        io.emit("userList", Array.from(users));
      }
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log("Server is now running");
});
