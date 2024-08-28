import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const rooms = new Map();

app
  .prepare()
  .then(() => {
    const httpServer = createServer((req, res) => {
      handler(req, res).catch((err) => {
        console.error("Error handling request:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      });
    });

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
      console.log("new socket connection", socket.id);
      socket.on("join-room", (roomId) => {
        console.log("join room", roomId);
        socket.join(roomId);
        const room = rooms.get(roomId);
        if (room) {
          room.members.push(socket.id);
        } else {
          rooms.set(roomId, { members: [socket.id] });
        }
      });

      socket.on("new Task", ({ roomId, task }) => {
        io.to(roomId).emit("new Task", task);
      });
    });

    httpServer
      .once("error", (err) => {
        console.error("Server Error:", err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  })
  .catch((err) => {
    console.error("App preparation error:", err);
  });
