import {Firestore} from "../config/firebaseInit";

export let getUserPossesion = (req, res) => {
    let uid = req.body.uid;
    if(uid == null || uid == "") res.json({"data": null, "msg": "err User not vaild"});
    Firestore.collection("storage").doc(uid)
        .get()
        .then((doc) => {
            return res.json({"data": doc.data(), "msg": (doc.exists ? "ok": "err User not found")});
        })
        .catch((error) => {
            return res.json({"data": null, "msg": "err "+error});
        });
};

const updateBalance = ( action, amount) => {

    if (action === 'set') {
        return amount;
    } else if (action === 'deposit') {
        return balance + amount;
    } else if (action === 'withdraw') {
        return balance - amount;
    }
}

export let updateUserBalance = (req, res) => {
    let uid = req.body.uid;
    let amount = req.body.data.amount;
    let action = req.body.data.action;
    let newBalance = updateBalance( action,amount);
    if(uid == null || uid == "") res.json({"data": null, "msg": "err User not vaild"});
    Firestore.collection("storage").doc(uid)
        .update("balance", newBalance)
        .then(() => {
            res.send('huhu')
        })
        .catch((error) => {
            return res.json({"data": null, "msg": "err "+error});
        });
}