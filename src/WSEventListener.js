import {Server} from "socket.io";
const {instrument} = require("@socket.io/admin-ui");
const gameCtrl = require("./controllers/gameController");

require("dotenv").config();

const port = process.env.BACKEND_PORT || 5678;
const ws_port = process.env.BACKEND_WS_PORT || 3456;
export const io = new Server(ws_port, {
    cors: {
        origin: ["http://localhost:"+port, "http://localhost:"+ws_port, "https://admin.socket.io/"],
    },
});
console.log("I can satisfy everyone' need in real-time at port " + ws_port);

io.on("connection", (socket) => {
    console.info(`[id=${socket.id}] Client connected`);
    socket.join(socket.request._query.id);
    socket.on("post-joinRoom", (uid, rid) => {
        console.info(`[sid=${socket.id} | uid=${uid} | rid=${rid}] Joined room.`);
        gameCtrl.updateSockID(uid, socket.id, rid);
        socket.join(rid);
    });
    socket.on("post-ready", (uid, rid, status) => {
        console.info(`[sid=${socket.id} | uid=${uid} | rid=${rid}] Ready phase ${status}`);
        socket.to(rid).emit("get-ready", uid, status);
        gameCtrl.updateReadyStatus(uid, socket.id, rid, status).then((state) => {
            if (state && status == 2) io.to(rid).emit("get-start", 2);
        });
    });
    socket.on("post-start", (uid, rid) => {
        console.info(`[sid=${socket.id} | uid=${uid} | rid=${rid}] Start`);
        gameCtrl.startGame(uid, socket.id, rid).then((status) => {
            if (status) io.to(rid).emit("get-start", 1);
        });
    });
    socket.on("disconnect", () => {
        console.info(`[id=${socket.id}] Client disconnected`);
    });
});

instrument(io, {
    auth: false,
    mode: "development",
});

export const sendMessage = (roomId, key, message) => {
    if (!roomId || process.env.BACKEND_WS_GLOBAL_EMIT === "True") {
        io.emit(key, message);
        console.info(`WS sent: ${key}: ${message}`);
    } else {
        io.to(roomId).emit(key, message);
        console.info(`WS sent to: ${roomId}/${key}: ${message}`);
    }
};

