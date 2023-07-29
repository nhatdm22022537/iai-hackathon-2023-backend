import {Firestore} from "../config/firebaseInit";
import {globalCache} from "../server";

export const internalGetUserInfo = async (uid) => {
    const cached = globalCache.get("users/" + uid);
    if (cached) return cached;
    else {
        try {
            const doc = await Firestore.collection("user_data")
                .doc(uid)
                .get();
            if (doc.exists) {
                globalCache.set("users/" + uid, doc.data());
                return doc.data();
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }
};

export const getUserInfo = async (req, res) => {
    const uid = req.body.uid;
    if (uid == null || uid == "") res.json({"msg": "err User not vaild", "data": null});
    const resUID = req.body.data;
    const data = await internalGetUserInfo(resUID);
    if (data) return res.json({"msg": "ok", "data": data});
    else return res.json({"msg": "err No data", "data": null});
};

export const setUserInfo = (req, res) => {
    const uid = req.body.uid;
    const newUserInfo = req.body.data;
    if (uid == null || uid == "") res.json({"msg": "err User not vaild", "data": null});
    if (newUserInfo == null || newUserInfo.uid != uid) res.json({"msg": "err Data not vaild", "data": null});
    Firestore.collection("user_data").doc(uid).update(newUserInfo)
        .then(() => {
            globalCache.set("users/"+uid, newUserInfo);
            return res.json({"msg": "ok", "data": null});
        })
        .catch((error) => {
            return res.json({"msg": "err "+error, "data": null});
        });
};
