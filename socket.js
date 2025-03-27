// socket.js
const { Server } = require("socket.io");

const initializeSocket = (server) => {
  // const io = new Server(server, {
  //   cors: {
  //     origin: "https://dashboard-xfpn.onrender.com",
  //     credentials: true,
  //   },
  // });

  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);

    socket.on("fetchMembers", async () => {
      try {
        const Member = require("./models/Member.model.js");
        const members = await Member.find({});
        socket.emit("membersData", { members });
      } catch (error) {
        console.error("Error fetching members via socket:", error);
        socket.emit("membersData", { members: [] });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;
