import {Firestore, Database} from "../config/firebaseInit";
import {b56gen} from "../utils";
import {globalCache} from "../server";
import {sendMessage} from "../wsEventListener";
import {internalGetUserInfo} from "./userController";
require("dotenv").config();

export const internalUpdateCacheListRoom = async (rid) => {
    let arr = globalCache.get("listUserRoom/"+rid);
    if (arr) return arr;
    return new Promise((resolve) => {
        arr = [];
        Database.ref("rooms_data/"+rid+"/userPart").once("value", async (data) => {
            if (!data.hasChildren()) {
                resolve(null);
                return;
            }
            for (const [key, value] of Object.entries(data.val())) {
                await internalGetUserInfo(key).then((data) => {
                    if (data) {
                        arr.push({
                            user: data,
                            data: value,
                        });
                    } else {
                        resolve(null);
                        return;
                    }
                });
            }
            globalCache.set("listUserRoom/"+rid, arr);
            resolve(arr);
        }, (error) => {
            console.log("Error when updating cache for room ", rid);
        });
    });
};

export const internalGetRoomInfo = async (rid) => {
    const data = globalCache.get("RoomsInfo/"+ rid);
    if (data) return data;
    const doc = await Firestore.collection("rooms").doc(rid).get();
    if (!doc.exists) return null;
    globalCache.set("RoomsInfo/"+ rid, doc.data());
    return doc.data();
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
    Firestore.collection("rooms").doc(rid).set({
        "rid": rid, // Room's id (string)
        "owner": uid, // Owner of the room (creator) (string)
        "name": data.name || "", // Name of the room (string)
        "desc": data.desc || "", // Description of the room (string)
        "diff": data.diff || 0.0, // Difficulty of the game (float - [0 to 1])
        "tframe": data.tframe || 30, // Maximum time allowed to answer a question (integer - second)
        "testid": data.testid || "", // Id of the test (saved in Flask) (string)
        "qnum": data.qnum || 0, // Number of question (integer)
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

export const getRoomInfo = async (req, res) => {
    const uid = req.body.uid;
    const rid = req.body.data;
    if (uid == null || uid == "" || rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    const doc = await internalGetRoomInfo(rid);
    if (doc) return res.json({"msg": "ok", "data": doc});
    else return res.json({"msg": "err Invalid room", "data": null});
};

export const updateRoom = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == null || uid == "" || data == null || data.rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    const doc = await internalGetRoomInfo(data.rid);
    if (doc == null) return res.json({"msg": "err Room not found", "data": null});
    if (uid != doc.owner) return res.json({"msg": "err No permission to change", "data": null});
    const rid = doc.rid;
    Firestore.collection("rooms").doc(rid).update(data)
        .then(() => {
            globalCache.del("RoomsInfo/"+rid);
            internalGetRoomInfo(rid);
            return res.json({"msg": "ok", "data": null});
        })
        .catch((error) => {
            return res.json({"msg": "err "+error, "data": null});
        });
};

export const deleteRoom = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == null || uid == "" || data == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    const doc = await internalGetRoomInfo(data);
    if (doc == null) return res.json({"msg": "err Room not found", "data": null});
    if (uid != doc.owner) return res.json({"msg": "err No permission to change", "data": null});
    Firestore.collection("rooms").doc(data).delete()
        .then(() => {
            Database.ref("rooms_data").child(data).remove((error) => {
                if (error) return res.json({"msg": "err "+error, "data": null});
                globalCache.del("RoomsInfo/"+data);
                globalCache.del("listUserRoom/"+data);
                return res.json({"msg": "ok", "data": null});
            });
        })
        .catch((error) => {
            return res.json({"msg": "err "+error, "data": null});
        });
};

export const getRoomUserList = (req, res) => {
    const uid = req.body.uid;
    const rid = req.body.data;
    if (uid == null || uid == "" || rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    internalUpdateCacheListRoom(rid).then((arr) => {
        if (arr) return res.json({"msg": "ok", "data": arr});
        else return res.json({"msg": "err Data not valid", "data": null});
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
    internalUpdateCacheListRoom(rid).then(async (arr) => {
        if (arr == null) return res.json({"msg": "err Invalid room", "data": null});
        const idx = arr.map((e) => e.user.uid).indexOf(uid);
        if (idx > -1) return res.json({"msg": "err User joined before", "data": null});
        const newUser = await internalGetUserInfo(uid);
        if (newUser == null) return res.json({"msg": "err User not valid", "data": null});
        Database.ref("rooms_data/"+rid+"/userPart").child(uid).set(initVal, async (error) => {
            if (error) {
                return res.json({"msg": "err "+error, "data": null});
            } else {
                sendMessage(rid, "get-join", newUser);
                arr.push({
                    user: newUser,
                    data: initVal,
                });
                globalCache.set("listUserRoom/"+rid, arr);
                return res.json({"msg": "ok", "data": null});
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
        const idx = arr.map((e) => e.user.uid).indexOf(uid);
        if (idx < 0) return res.json({"msg": "err User left before", "data": null});
        Database.ref("rooms_data/"+rid+"/userPart").child(uid).remove((error) => {
            if (error) {
                return res.json({"msg": "err "+error, "data": null});
            } else {
                sendMessage(rid, "get-leave", uid);
                arr.splice(idx, 1);
                globalCache.set("listUserRoom/"+rid, arr);
                return res.json({"msg": "ok", "data": null});
            }
        });
    });
};

