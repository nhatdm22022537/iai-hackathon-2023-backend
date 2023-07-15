import { Firestore, Database } from "../config/firebaseInit";
import { b56gen } from "../utils";
import { sendMessage } from "../server";
import { internalGetUserInfo } from "./userController";

export let createRoom = async(req, res) => {
    let uid = req.body.uid;
    let data = req.body.data;
    if(uid == null || uid == "" || data == null || data.name == null || data.name == "" || data.desc == null || data.desc == "") {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    let ok = false;
    let rid = b56gen(process.env.ROOM_ID_LENGTH || 6);
    while(!ok) {
        let tmpDoc = await Firestore.collection("rooms").doc(rid).get();
        if(!tmpDoc.exists) ok = true;
    }
    Firestore.collection("rooms").doc(rid).set({
        "rid": rid,
        "owner": uid,
        "name": data.name || null,
        "desc": data.desc || null,
    })
    .then(() => {
        
    })
    .catch((error) => {
        return res.json({"msg": "err "+error, "data": null});
    });
    Database.ref("rooms_data/"+rid+"/userPart").child(uid).set({
        "mode": 9
    }, (error) => {
        if(error) {
            return res.json({"msg": "err "+error, "data": null});
        }
        else {
            return res.json({"msg": "ok", "data": rid});
        }
    });
};

export let joinRoom = (req, res) => {
    let uid = req.body.uid;
    let rid = req.body.data;
    if(uid == null || uid == "" || rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    Database.ref("rooms_data/"+rid+"/userPart").child(uid).set({
        "mode": 1
    }, async (error) => {
        if(error) {
            return res.json({"msg": "err "+error, "data": null});
        }
        else {
            sendMessage(rid, "join", await internalGetUserInfo(uid));
            // sendMessage(null, "join", await internalGetUserInfo(uid)); // testing globally, will change soon(tm)
            return res.json({"msg": "ok", "data": null});
        }
    });
}

export let leaveRoom = (req, res) => {
    let uid = req.body.uid;
    let rid = req.body.data;
    if(uid == null || uid == "" || rid == null) {
        return res.json({"msg": "err Data not vaild", "data": null});
    }
    Database.ref("rooms_data/"+rid+"/userPart").child(uid).remove((error) => {
        if(error) {
            return res.json({"msg": "err "+error, "data": null});
        }
        else {
            sendMessage(rid, "leave", uid);
            // sendMessage(null, "leave", uid); // testing globally, will change soon(tm)
            return res.json({"msg": "ok", "data": null});
        }
    });
}

