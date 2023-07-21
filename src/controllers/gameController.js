import {globalCache} from "../server";
import {internalGetRoomInfo, internalUpdateCacheListRoom} from "./roomController";

export const internalGetGameInfo = async (rid) => {
    let gameData = globalCache.get("gameDataPublic/"+rid);
    if (gameData) return gameData;
    gameData = {details: {}, players: {}};
    const arr = await internalUpdateCacheListRoom(rid);
    if (arr == null) return false;
    arr.forEach((e) => {
        Object.assign(gameData.players, {
            [e.uid]: {
                online: false,
                ready: (e.data.mode == 9 ? 9 : 0),
            },
        });
    });
    globalCache.set("gameDataPublic/"+rid, gameData);
    return gameData;
};

export const internalUpdateAllReady = async (sid, status) => {
    const rid = globalCache.get("ridOfSid/"+sid);
    if (rid == null) return null;
    const gameData = await internalGetGameInfo(rid);
    if (gameData == false) return null;
    // eslint-disable-next-line no-unused-vars
    for (const [key, value] of Object.entries(gameData.players)) {
        if (value.online == true && value.ready < status) return false;
    }
    return true;
};

export const internalUpdateOnlineStatus = async (sid, status) => {
    const uid = globalCache.get("uidOfSid/"+sid);
    const rid = globalCache.get("ridOfSid/"+sid);
    if (uid == null || rid == null) return null;
    const gameData = await internalGetGameInfo(rid);
    if (gameData == false) return null;
    Object.assign(gameData.players[uid], {
        online: status,
    });
    globalCache.set("gameDataPublic/"+rid, gameData);
    return true;
};

export const internalUpdateSockID = async (uid, sid, rid) => {
    globalCache.set("ridOfSid/"+sid, rid);
    globalCache.set("uidOfSid/"+sid, uid);
    await internalUpdateOnlineStatus(sid, true);
    return true;
};

export const internalUpdateReadyStatus = async (sid, status) => {
    const uid = globalCache.get("uidOfSid/"+sid);
    const rid = globalCache.get("ridOfSid/"+sid);
    if (uid == null || rid == null) return null;
    const gameData = await internalGetGameInfo(rid);
    if (gameData == false) return null;
    Object.assign(gameData.players[uid], {
        ready: parseInt(status),
    });
    globalCache.set("gameDataPublic/"+rid, gameData);
    return true;
};

export const startGame = async (sid) => {
    const uid = globalCache.get("uidOfSid/"+sid);
    const rid = globalCache.get("ridOfSid/"+sid);
    if (uid == null || rid == null) return null;
    const doc = await internalGetRoomInfo(rid);
    if (doc.owner != uid) return null;
    const result = await internalUpdateAllReady(sid, 1);
    if (result == true) {
        const gameData = await internalGetGameInfo(rid);
        if (gameData == null) return null;
        Object.assign(gameData.details, {
            phase: 1,
        });
        globalCache.set("gameDataPublic/"+rid, gameData);
    }
    return result;
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
