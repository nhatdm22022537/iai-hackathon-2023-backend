import {Server} from "socket.io";
import {globalCache} from "./server";
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
    let uid = "";
    let rid = "";
    let busy = false;
    console.info(`[id=${socket.id}] Client connected`);
    socket.join(socket.request._query.id);

    socket.on("post-joinRoom", (rquid, rqrid) => {
        console.info(`[sid=${socket.id} | uid=${rquid} | rid=${rqrid}] Joined room.`);
        gameCtrl.internalUpdateSockID(rquid, socket.id, rqrid);
        uid = rquid;
        rid = rqrid;
        socket.join(rqrid);
        io.to(rid).emit("get-state", uid, true);
        busy = false;
    });

    socket.on("post-ready", (status) => {
        console.info(`[sid=${socket.id} | uid=${uid} | rid=${rid}] Ready phase ${status}`);
        gameCtrl.internalUpdateReadyStatus(socket.id, status).then(async (res) => {
            if (res) socket.to(rid).emit("get-ready", uid, status);
            busy = false;
        });
    });

    const allReady = async (event) => {
        busy = true;
        // im busy chotto matte
        let retries = 100; // wait for 10s, thats it
        while (busy && retries) {
            retries -= 1;
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        const listenForAllReady = globalCache.get("listenForAllReady/"+rid);
        if (listenForAllReady) {
            gameCtrl.internalUpdateAllReady(socket.id, 2).then((status) => {
                if (status) {
                    io.to(rid).emit("get-start", 2);
                    globalCache.set("listenForAllReady/"+rid, false);
                }
            });
        }
    };

    socket.onAny(allReady);

    socket.on("post-start", () => {
        console.info(`[sid=${socket.id} | uid=${uid} | rid=${rid}] Start`);
        gameCtrl.startGame(socket.id).then(async (status) => {
            if (status) {
                io.to(rid).emit("get-start", 1);
                await internalGetCorrectAnswer(rid); // starting to fetch answer
                globalCache.set("listenForAllReady/"+rid, true); // only listen when server fully loaded
            }
            busy = false;
        });
    });

    socket.on("post-answer", (noQues, ans) => {
        console.info(`[sid=${socket.id} | uid=${uid} | rid=${rid}] Question ${noQues}, chose ${ans}`);
        gameCtrl.internalCheckAns(socket.id, noQues, ans).then((status) => {
            socket.emit("get-answer", noQues, status);
            busy = false;
        });
    });

    socket.on("disconnect", () => {
        gameCtrl.internalUpdateOnlineStatus(socket.id, false);
        io.to(rid).emit("get-state", uid, false);
        console.info(`[id=${socket.id}] Client disconnected`);
        busy = false;
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

