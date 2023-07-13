import { Firestore } from "../config/firebaseInit";

export let getUserInfo = (req, res) => {
    let uid = req.params.uid;
    if(uid == null || uid == "") res.json({"data": null, "msg": "err User not found"});
    Firestore.collection("user_data").doc(uid).get()
    .then((doc) => {
        res.json({"data": doc.data(), "msg": (doc.exists ? "ok": "err User not found")});
    })
    .catch((error) => {
        res.json({"data": null, "msg": "err "+error.message});
    });
};

export let setUserInfo = (req, res) => {
    let uid = req.params.uid;
    let newUserInfo = req.body;
    if(uid == null || uid == "") res.json({"msg": "err User not found"});
    if(newUserInfo == null || newUserInfo.uid != uid) res.json({"msg": "err Request not vaild"});
    Firestore.collection("user_data").doc(uid).set(newUserInfo)
    .then(() => {
        res.json({"msg": "ok"});
    })
    .catch((error) => {
        res.json({"msg": "err"+error.message});
    });
};
