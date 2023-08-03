import {globalCache} from "../server";
import {internalGetRoomInfo, internalUpdateCacheListRoom} from "./roomController";
import {internalUpdateUserBalance} from "./possessionController";
import {Database, ServerValue} from "../config/firebaseInit";
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
                ended: false,
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

export const internalCheckAllEnded = async (rid) => {
    if (rid == null) return null;
    const gameData = await internalGetGameInfo(rid);
    if (gameData == false) return null;
    // eslint-disable-next-line no-unused-vars
    for (const [key, value] of Object.entries(gameData.players)) {
        if (value.online == true && (value.ready < 2 || value.ended == false)) return false;
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
                ready: 0,
                ended: false,
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
    if (gameData.players[uid] == null) {
        Object.assign(gameData.players, {
            [uid]: {
                online: true,
                ready: parseInt(status),
                ended: false,
            },
        });
    } else {
        Object.assign(gameData.players[uid], {
            ready: parseInt(status),
        });
    }

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

export const internalCalcPoint = async (uid, rid, status, corStreak, incorStreak, timeTaken, pStats) => {
    const data = await internalGetRoomInfo(rid);
    let scP = 1;
    let scE = 1;
    if (pStats.hp == 1) {
        scP = 0.6;
        scE = 1.5;
    }
    if (status) {
        return ~~((450 + 30*pStats.atk) * (0.5 + (Math.min(10, corStreak)/10)*0.3 + (1-(timeTaken/(1000*data.tframe)))*0.7) * (0.7 + data.diff) * scP * (1+pStats.buff));
    } else {
        return ~~(-150 * (0.5 + (Math.min(5, incorStreak)/5)*0.5) * (0.8 + data.diff) * (1+(20-pStats.def)/20) * scE);
    }
};

export const internalCalcGem = async (rid, points) => {
    const data = await internalGetRoomInfo(rid);
    return ~~(Math.max(points/100, 0) * (0.8+data.diff*2));
};

export const internalAfterGame = async (uid, rid, points, gems, corCnt) => {
    await internalUpdateUserBalance(uid, "deposit", gems);
    return new Promise((resolve) => {
        Database.ref(`rooms_data/${rid}/userPart/${uid}`).update({
            points,
            gems,
            corCnt,
            ts: ServerValue.TIMESTAMP,
        }, (error) => {
            if (error) {
                resolve(false);
                return;
            }
            resolve(true);
            return;
        });
    });
};

export const internalCheckOwner = async (uid, rid) => {
    if (uid == null || rid == null) return false;
    const doc = await internalGetRoomInfo(rid);
    if (doc.owner != uid) return false;
    return true;
};

export const postGameContext = async (req, res) => {
    const uid = req.body.uid;
    const rid = req.body.rid;
    const data = req.body.data;
    if (uid == null || uid == "" || rid == null || rid == "" || data == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    globalCache.set(`gameContext/${rid}/${uid}`, data, 28800);
    return res.json({"msg": "ok", "data": null});
};

export const getGameContext = async (req, res) => {
    const uid = req.body.uid;
    const rid = req.body.rid;
    if (uid == null || uid == "" || rid == null || rid == "") {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    return res.json({"msg": "ok", "data": globalCache.get(`gameContext/${rid}/${uid}`)});
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
