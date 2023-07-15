import express from "express";
import bodyParser from "body-parser";
import {initWebRoutes} from './routes';
import { Server } from "socket.io";
const NodeCache = require("node-cache");
require('dotenv').config();

import morgan from "morgan";
const { instrument } = require("@socket.io/admin-ui");

let app = express();

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

initWebRoutes(app);

let port = process.env.BACKEND_PORT || 8080;

app.listen(port, () => {
    console.log("I'm a cute backend and as the brain of this project I'm happy to serve everyone' request at port " + port)
})

let ws_port = process.env.BACKEND_WS_PORT || 3000;
export const io = new Server(ws_port, {
    cors: {
        origin: ["http://localhost:"+port, "http://localhost:"+ws_port, "https://admin.socket.io/"],
    }
});
console.log("I can satisfy everyone' need in real-time at port " + ws_port)
io.on('connection', (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    socket.join(socket.request._query.id);
    socket.on('disconnect', () => {
        console.info(`Client disconnected [id=${socket.id}]`);
    });
});

instrument(io, {
    auth: false,
    mode: "development",
});

export const sendMessage = (roomId, key, message) => {
    if(roomId) {
        io.to(roomId).emit(key, message);
        console.info(`WS sent to: ${roomId}/${key}: ${message}`);
    }
    else {
        io.emit(key, message);
        console.info(`WS sent: ${key}: ${message}`);
    }
}

export const globalCache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 259200, checkperiod: process.env.CACHE_CHECK || 302400});