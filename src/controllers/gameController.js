import {globalCache} from "../server";
import {internalGetRoomInfo, internalUpdateCacheListRoom} from "./roomController";
const axios = require("axios");
require("dotenv").config();

export const internalGetGameInfo = async (rid) => {
    let gameData = globalCache.get("gameDataPublic/"+rid);
    if (gameData) return gameData;
    gameData = {details: {}, players: {}};
    const arr = await internalUpdateCacheListRoom(rid);
    if (arr == null) return false;
    arr.forEach((e) => {
        Object.assign(gameData.players, {
            [e.user.uid]: {
                online: false,
                ready: (e.data.mode == 9 ? 9 : 0),
            },
        });
    });
    globalCache.set("gameDataPublic/"+rid, gameData);
    return gameData;
};

export const internalGetCorrectAnswer = async (rid) => {
    const gameAns = globalCache.get("gameAnswer/"+rid);
    if (gameAns) return gameAns;
    const testId = (await internalGetRoomInfo(rid)).testid;
    return new Promise((resolve) => {
        const config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:${process.env.BACKEND_FLASK_PORT}/data/${testId}/answers`,
            headers: { },
        };
        axios.request(config)
            .then((response) => {
                globalCache.set("gameAnswer/"+rid, response.data.answers);
                return resolve(response.data.answers);
            })
            .catch((error) => {
                console.log("Flask server error: ", error);
                return resolve(null);
            });
    });
};

export const internalCheckAns = async (noQues, ans, uid, rid) => {
    if (uid == null || rid == null) return null;
    const gameAns = await internalGetCorrectAnswer(rid);
    return (gameAns[noQues] == ans);
};

export const internalCheckAllReady = async (status, rid) => {
    if (rid == null) return null;
    const gameData = await internalGetGameInfo(rid);
    if (gameData == false) return null;
    // eslint-disable-next-line no-unused-vars
    for (const [key, value] of Object.entries(gameData.players)) {
        if (value.online == true && value.ready < status) return false;
    }
    return true;
};

export const internalUpdateOnlineStatus = async (status, uid, rid) => {
    if (uid == null || rid == null) return null;
    const gameData = await internalGetGameInfo(rid);
    if (gameData == false) return null;
    if (gameData.players[uid] == null) {
        Object.assign(gameData.players, {
            [uid]: {
                online: status,
            },
        });
    } else {
        Object.assign(gameData.players[uid], {
            online: status,
        });
    }
    globalCache.set("gameDataPublic/"+rid, gameData);
    return true;
};

export const internalUpdateReadyStatus = async (status, uid, rid) => {
    if (uid == null || rid == null) return null;
    const gameData = await internalGetGameInfo(rid);
    if (gameData == false) return null;
    Object.assign(gameData.players[uid], {
        ready: parseInt(status),
    });
    globalCache.set("gameDataPublic/"+rid, gameData);
    return true;
};

export const internalStartGame = async (uid, rid) => {
    if (uid == null || rid == null) return null;
    const doc = await internalGetRoomInfo(rid);
    if (doc.owner != uid) return null;
    const result = await internalCheckAllReady(1, rid);
    if (result == true) {
        const gameData = await internalGetGameInfo(rid);
        if (gameData == null) return null;
        globalCache.set("gameDataPublic/"+rid, gameData);
    }
    return result;
};

export const internalCalcPoint = async (uid, rid, status, correctStreak, incorStreak, timeTaken) => {
    const data = await internalGetRoomInfo(rid);
    if (status) {
        return ~~(700 * (0.5 + (Math.min(10, correctStreak)/10)*0.5 + (0.5 - timeTaken/(2000*data.tframe))) * (1.5 - data.diff));
    } else {
        return ~~(-200 * (0.5 + (Math.min(5, incorStreak)/5)*0.5) * (0.5 + data.diff));
    }
};

export const getGameStatus = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == null || uid == "" || data == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    const result = await internalGetGameInfo(data);
    if (result == false) return res.json({"msg": "err Data not vaild", "data": null});
    return res.json({"msg": "ok", "data": result});
};
