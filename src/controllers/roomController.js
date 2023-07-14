import { Firestore, Database } from "../config/firebaseInit";
import { b56gen } from "../utils";

export let createRoom = async(req, res) => {
    let uid = req.body.uid;
    let data = req.body.data;
    if(uid == null || uid == "" || data == null || data.name == null || data.name == "" || data.desc == null || data.desc == "") {
        return res.json({"data": null, "msg": "err Data not vaild"});
    }
    let ok = false;
    let rid = b56gen(process.env.ROOM_ID_LENGTH);
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
        return res.json({"data": null, "msg": "err "+error});
    });
    Database.ref("rooms_data/"+rid+"/userPart").child(uid).set({
        "mode": 9
    }, (error) => {
        if(error) {
            return res.json({"data": null, "msg": "err "+error});
        }
        else {
            return res.json({"data": rid, "msg": "ok"});
        }
    });
};
