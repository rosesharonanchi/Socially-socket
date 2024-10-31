const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  // When connected
  console.log("A user connected:", socket.id);

  // Listen for addUser event to add the user to the list
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users); // Emit updated users list to all connected clients
  });

  // Listen for sendMessage event and emit it to the receiver
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId); // Get the receiver's socket
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    removeUser(socket.id);
    io.emit("getUsers", users); // Emit updated users list to all connected clients
  });
});
