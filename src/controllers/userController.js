import { Firestore } from "../config/firebaseInit";
import { globalCache } from "../server";

export let internalGetUserInfo = async (uid) => {
    let cached = globalCache.get("users/" + uid);
    if(cached) {
        return cached;
    }
    else {
        let doc = await Firestore.collection("user_data").doc(uid).get();
        if(doc.exists) {
            globalCache.set("users/" + uid, doc.data());
            return doc.data();
        }
        else return null;
    }
}

export let getUserInfo = async (req, res) => {
    let uid = req.body.uid;
    if(uid == null || uid == "") res.json({"msg": "err User not vaild", "data": null});
    let resUID = req.body.data;
    let data = await internalGetUserInfo(resUID);
    if(data) return res.json({ "msg": "ok", "data": data});
    else return res.json({"msg": "err ", "data": null});
};

export let setUserInfo = (req, res) => {
    let uid = req.body.uid;
    let newUserInfo = req.body.data;
    if(uid == null || uid == "") res.json({"msg": "err User not vaild", "data": null});
    if(newUserInfo == null || newUserInfo.uid != uid) res.json({"msg": "err Data not vaild", "data": null});
    Firestore.collection("user_data").doc(uid).update(newUserInfo)
    .then(() => {
        globalCache.set("users/"+uid, newUserInfo);
        return res.json({"msg": "ok", "data": null});
    })
    .catch((error) => {
        return res.json({"msg": "err "+error, "data": null});
    });
};
