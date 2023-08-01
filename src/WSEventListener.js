import {Server} from "socket.io";
import {globalCache} from "./server";
const gameCtrl = require("./controllers/gameController");

require("dotenv").config();

const port = process.env.BACKEND_PORT || 5678;
const ws_port = process.env.BACKEND_WS_PORT || 3456;
export const io = new Server(ws_port, {
    cors: {
        origin: ["http://localhost:"+port, "http://localhost:"+ws_port],
    },
});
console.log("I can satisfy everyone' need in real-time at port " + ws_port);

io.on("connection", (socket) => {
    let uid = "";
    let rid = "";
    let points = 0;
    let correctStreak = 0;
    let incorStreak = 0;
    let corCnt = 0;
    let timestamp = 0;
    let busy = false;
    console.info(`[id=${socket.id}] Client connected`);
    socket.join(socket.request._query.id);

    const logInfo = (msg, sv = false) => {
        if (sv) console.info(`[rid=${rid} | server]: ${msg}.`);
        else console.info(`[rid=${rid} | uid=${uid} | sid=${socket.id}]: ${msg}.`);
    };
    socket.on("post-joinRoom", async (rquid, rqrid) => {
        uid = rquid;
        rid = rqrid;
        socket.join(rqrid);
        await gameCtrl.internalUpdateOnlineStatus(true, uid, rid);
        logInfo("Joined room");
        io.to(rid).emit("get-state", uid, true);
        busy = false;
    });

    socket.on("post-ready", (status) => {
        gameCtrl.internalUpdateReadyStatus(status, uid, rid).then(async (res) => {
            logInfo(`Ready phase ${status}`);
            if (res) socket.to(rid).emit("get-ready", uid, status);
            busy = false;
        });
    });

    const allReady = async (event) => {
        busy = true;
        // im busy chotto matte
        let retries = 200; // wait for 10s, thats it
        while (busy && retries > 0) {
            retries -= 1;
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        const listenForAllReady = globalCache.get("listenForAllReady/"+rid);
        if (listenForAllReady) {
            gameCtrl.internalCheckAllReady(2, rid).then((status) => {
                if (status) {
                    logInfo("Game start phase 2", true);
                    io.to(rid).emit("get-start", 2);
                    globalCache.del("listenForAllReady/"+rid);
                    socket.offAny(allReady);
                }
            });
        }
    };

    socket.onAny(allReady);

    socket.on("post-start", () => {
        gameCtrl.internalStartGame(uid, rid).then(async (status) => {
            if (status) {
                logInfo("Game start phase 1", true);
                io.to(rid).emit("get-start", 1);
                await gameCtrl.internalGetCorrectAnswer(rid); // starting to fetch answer
                globalCache.set("listenForAllReady/"+rid, true); // only listen when server fully loaded
            }
            busy = false;
        });
    });

    socket.on("post-startQues", (noQues) => {
        logInfo(`Question ${noQues}, started`);
        timestamp = Date.now();
    });

    socket.on("post-answer", (noQues, ans, playerStats) => {
        gameCtrl.internalCheckAns(noQues, ans, uid, rid).then(async (status) => {
            socket.emit("get-answer", noQues, status);
            const timeTaken = Date.now() - timestamp;
            const delta = await gameCtrl.internalCalcPoint(uid, rid, status, correctStreak, incorStreak, timeTaken, playerStats);
            logInfo(`Question ${noQues}, chose ${ans} in ${timeTaken}ms, ${status ? "" : "in"}correct, ${delta} points`);
            points += delta;
            if (status) {
                corCnt += 1;
                correctStreak += 1;
                incorStreak = 0;
            } else {
                incorStreak += 1;
                correctStreak = 0;
            }
            logInfo("Player info updated");
            io.to(rid).emit("get-playerData", uid, correctStreak, corCnt, points);
            busy = false;
        });
    });

    socket.on("post-end", async () => {
        const gems = await gameCtrl.internalCalcGem(rid, points);
        logInfo(`Player completed the game, got ${gems} gems`);
        io.to(rid).emit("get-end", uid, gems);
        await gameCtrl.internalAfterGame(uid, rid, points, gems, corCnt);
        busy = false;
    });

    socket.on("post-stop", async () => {
        logInfo("Owner-sama stopped the game");
        // todo: update leaderboard, cleanup after game
        busy = false;
    });

    socket.on("disconnect", () => {
        gameCtrl.internalUpdateOnlineStatus(false, uid, rid);
        io.to(rid).emit("get-state", uid, false);
        logInfo("Disconnected");
        socket._cleanup();
        socket.removeAllListeners();
        socket.disconnect(true);
        busy = false;
    });
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

