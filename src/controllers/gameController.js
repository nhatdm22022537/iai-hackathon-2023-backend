import {globalCache} from "../server";
import {internalGetNumUser, internalGetRoomInfo} from "./roomController";


export const updateSockID = (uid, sid, rid) => {
    globalCache.set("sidOfUid/"+rid+"/"+uid, sid);
};

export const updateReadyStatus = async (uid, sid, rid, status) => {
    if (globalCache.get("sidOfUid/"+rid+"/"+uid) != sid) return null;
    let rdyCnt = globalCache.get("readyCount/"+rid+"/");
    if (rdyCnt == null) rdyCnt = 1;
    let obj = globalCache.get("gameDataPublic/"+rid);
    if (obj == null) obj = {};
    return new Promise((resolve) => {
        internalGetNumUser(rid).then((number) => {
            Object.assign(obj, {
                [uid]: {
                    ready: status,
                },
            });
            if (status > 0) ++rdyCnt;
            else if (status == 0) --rdyCnt;
            globalCache.set("readyCount/"+rid+"/", rdyCnt);
            globalCache.set("gameDataPublic/"+rid, obj);
            console.log(`Ready: ${rdyCnt}/${number}`);
            resolve((rdyCnt >= number ? true : false));
        });
    });
};

export const getGameStatus = (req, res) => {
    return res.json(globalCache.get("gameDataPublic/"+rid));
};

export const startGame = async (uid, sid, rid) => {
    if (globalCache.get("sidOfUid/"+rid+"/"+uid) != sid) return false;
    const doc = await internalGetRoomInfo(rid);
    if (doc.owner != uid) return null;
    return new Promise((resolve) => {
        updateReadyStatus(uid, sid, rid, -1).then((canStart) => {
            console.log("csiudhcui", canStart);
            if (canStart) {
                globalCache.set("readyCount/"+rid+"/", 1);
                resolve(true);
            } else resolve(false);
        });
    });
};
