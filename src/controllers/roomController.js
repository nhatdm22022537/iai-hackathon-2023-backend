import {Firestore, Database} from "../config/firebaseInit";
import {b56gen} from "../utils";
import {sendMessage, globalCache} from "../server";
import {internalGetUserInfo} from "./userController";
require("dotenv").config();

export const internalUpdateCacheListRoom = async (rid) => {
    let arr = globalCache.get("listUserRoom/"+rid);
    if (arr) return arr;
    return new Promise((resolve) => {
        arr = [];
        Database.ref("rooms_data/"+rid+"/userPart").once("value", async (data) => {
            let hasData = false;
            for (const [key, value] of Object.entries(data.val())) {
                hasData = true;
                await internalGetUserInfo(key).then((data) => {
                    arr.push({
                        uid: key,
                        user: data,
                        data: value,
                    });
                });
            }
            if (hasData) {
                globalCache.set("listUserRoom/"+rid, arr);
                resolve(arr);
            } else {
                resolve(null);
            }
        }, (error) => {
            console.log("Error when updating cache for room ", rid);
        });
    });
};

export const createRoom = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == null || uid == "" || data == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    let ok = false;
    const rid = b56gen(process.env.ROOM_ID_LENGTH || 6);
    while (!ok) {
        const tmpDoc = await Firestore.collection("rooms").doc(rid).get();
        if (!tmpDoc.exists) ok = true;
    }
    // todo: another mode if request has docx attached to it
    Firestore.collection("rooms").doc(rid).set({
        "rid": rid,
        "owner": uid,
        "name": data.name || "",
        "desc": data.desc || "",
        // "testId" // Id of the test saved locally (string)
        // "qNum" // Number of question (integer)
        // "diff" // Difficulty of the game (integer)
    })
        .then(() => {

        })
        .catch((error) => {
            return res.json({"msg": "err "+error, "data": null});
        });
    Database.ref("rooms_data/"+rid+"/userPart").child(uid).set({
        "mode": 9,
    }, (error) => {
        if (error) {
            return res.json({"msg": "err "+error, "data": null});
        } else {
            internalUpdateCacheListRoom(rid);
            return res.json({"msg": "ok", "data": rid});
        }
    });
};

export const updateRoom = (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == null || uid == "" || data == null || data.rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    // todo: check server-side.
    if (uid != data.owner) return res.json({"msg": "err No permission to change", "data": null});
    const rid = data.rid;
    Firestore.collection("rooms").doc(rid).update(data)
        .then(() => {
            return res.json({"msg": "ok", "data": null});
        })
        .catch((error) => {
            return res.json({"msg": "err "+error, "data": null});
        });
};

export const deleteRoom = (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == null || uid == "" || data == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    // todo: check server-side.
    // if(uid != data) return res.json({"msg": "err No permission to change", "data": null});
    Firestore.collection("rooms").doc(data).delete()
        .then(() => {
            Database.ref("rooms_data").child(data).remove((error) => {
                if (error) return res.json({"msg": "err "+error, "data": null});
                return res.json({"msg": "ok", "data": null});
            });
        })
        .catch((error) => {
            return res.json({"msg": "err "+error, "data": null});
        });
};

export const joinRoom = (req, res) => {
    const uid = req.body.uid;
    const rid = req.body.data;
    if (uid == null || uid == "" || rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    const initVal = {
        "mode": 1,
    };
    internalUpdateCacheListRoom(rid).then((arr) => {
        if (arr == null) return res.json({"msg": "err Invalid room", "data": null});
        Database.ref("rooms_data/"+rid+"/userPart").child(uid).set(initVal, async (error) => {
            if (error) {
                return res.json({"msg": "err "+error, "data": null});
            } else {
                const idx = arr.map((e) => e.uid).indexOf(uid);
                if (idx > -1) {
                    return res.json({"msg": "err User joined before", "data": null});
                } else {
                    const newUser = await internalGetUserInfo(uid);
                    sendMessage(rid, "join", newUser);
                    arr.push({
                        uid: uid,
                        user: newUser,
                        data: initVal,
                    });
                    globalCache.set("listUserRoom/"+rid, arr);
                    return res.json({"msg": "ok", "data": null});
                }
            }
        });
    });
};

export const leaveRoom = (req, res) => {
    const uid = req.body.uid;
    const rid = req.body.data;
    if (uid == null || uid == "" || rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    internalUpdateCacheListRoom(rid).then((arr) => {
        if (arr == null) return res.json({"msg": "err Invalid room", "data": null});
        Database.ref("rooms_data/"+rid+"/userPart").child(uid).remove((error) => {
            if (error) {
                return res.json({"msg": "err "+error, "data": null});
            } else {
                const idx = arr.map((e) => e.uid).indexOf(uid);
                if (idx > -1) {
                    sendMessage(rid, "leave", uid);
                    arr.splice(idx, 1);
                    globalCache.set("listUserRoom/"+rid, arr);
                    return res.json({"msg": "ok", "data": null});
                } else {
                    return res.json({"msg": "err User left before", "data": null});
                }
            }
        });
    });
};

export const getRoomUserList = (req, res) => {
    const uid = req.body.uid;
    const rid = req.body.data;
    if (uid == null || uid == "" || rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    internalUpdateCacheListRoom(rid).then((arr) => {
        return res.json({"msg": "ok", "data": arr});
    });
};

export const getRoomInfo = async (req, res) => {
    const uid = req.body.uid;
    const rid = req.body.data;
    if (uid == null || uid == "" || rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    const doc = await Firestore.collection("rooms").doc(rid).get();
    if (!doc.exists) return res.json({"msg": "err Invalid room", "data": null});
    else return res.json({"msg": "ok", "data": doc.data()});
};
