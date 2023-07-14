import { Firestore } from "../config/firebaseInit";

export let getUserInfo = (req, res) => {
    let uid = req.body.uid;
    let resUID = req.body.data;
    if(uid == null || uid == "") res.json({"data": null, "msg": "err User not vaild"});
    Firestore.collection("user_data").doc(resUID).get()
    .then((doc) => {
        return res.json({"data": doc.data(), "msg": (doc.exists ? "ok": "err User not found")});
    })
    .catch((error) => {
        return res.json({"data": null, "msg": "err "+error});
    });
};

export let setUserInfo = (req, res) => {
    let uid = req.body.uid;
    let newUserInfo = req.body.data;
    if(uid == null || uid == "") res.json({"msg": "err User not vaild"});
    if(newUserInfo == null || newUserInfo.uid != uid) res.json({"msg": "err Data not vaild"});
    Firestore.collection("user_data").doc(uid).update(newUserInfo)
    .then(() => {
        return res.json({"msg": "ok"});
    })
    .catch((error) => {
        return res.json({"msg": "err "+error});
    });
};
