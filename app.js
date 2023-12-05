const http = require("http");
//-
const express = require("express");
//-
const { Server } = require("socket.io");
//-
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 6820;

// statics
app.use(express.static("public"));

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});

const users = {};
let currentRoom = [];

io.on("connection", (socket) => {
  socket.on("login", (data) => {
    users[socket.id] = data.name;
    io.sockets.emit("online", users);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    socket.rooms.clear();
    io.sockets.emit("online", users);
  });

  socket.on("chat", (data) => {
    if (data.room != "") {
      io.to(data.room).emit("chat", data);
    } else {
      io.sockets.emit("chat", data);
    }
    socket.off("type", () => {});
    io.sockets.emit("remove-type");
  });

  socket.on("type", (data) => {
    socket.broadcast.emit("type", data);
  });

  socket.on("remove-type", () => {
    socket.off("type");
  });

  socket.on("join-room", (room) => {
    currentRoom = [];
    socket.join(room);
    socket.rooms.forEach((r) => {
      if (r != socket.id) {
        currentRoom.push(r);
      }
    });
    io.to(socket.id).emit("rooms", currentRoom);
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);
    currentRoom = currentRoom.filter((r) => r != room);
    io.to(socket.id).emit("rooms", currentRoom);
  });
});
