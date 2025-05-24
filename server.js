const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };
    socket.to(room).emit("chat-message", {
      username: "System",
      message: `${username} joined the chat.`,
    });
  });

  socket.on("send-message", ({ room, username, message }) => {
    socket.to(room).emit("chat-message", { username, message });
  });

  socket.on("typing", ({ room, username }) => {
    socket.to(room).emit("typing", username);
  });

  socket.on("stop-typing", ({ room }) => {
    socket.to(room).emit("stop-typing");
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      socket.to(user.room).emit("chat-message", {
        username: "System",
        message: `${user.username} left the chat.`,
      });
      delete users[socket.id];
    }
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
